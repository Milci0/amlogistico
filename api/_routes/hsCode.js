// api/_routes/hsCode.js
// Wyszukiwarka kodu celnego AI (krok 2 kreatora). Doczepiona do istniejącej funkcji
// Express (limit funkcji serverless na Vercelu) — mount w api/index.js.
//
// Przepływ: auth → walidacja/sanityzacja → cache → (rate-limit) → LLM → zapis → log.
// Klucz API wyłącznie po stronie serwera (patrz _lib/anthropic.js).

import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import { tryConsume } from '../_lib/hsRateLimit.js'
import { suggestSchema, logChoiceSchema, sanitizeInput, ValidationError } from '../_validation/hsCode.js'
import { formatZodError } from '../_validation/auth.js'
import { isEU, officialTariffSources, COUNTRY_NAMES_PL, TARIFF_SYSTEM_NAMES } from '../_config/tariffSources.js'
import { findCandidates, classifyFromCandidates, searchDestinationCode } from '../_lib/hsSuggest.js'
import { MODEL_CLASSIFY, MODEL_WEB_SEARCH, MODEL_RATES } from '../_lib/anthropic.js'

const router = Router()
router.use(requireAuth)

const CACHE_TTL_DAYS = 90

function cacheKey(description, countryFrom, countryTo) {
  const norm = description.toLowerCase().trim() + countryFrom + countryTo
  return crypto.createHash('sha256').update(norm).digest('hex')
}

// Stawki cenowe (USD/1M tokenów): Haiku $1/$5, Sonnet 5 $3/$15; web_search
// ~$10/1000 = $0.01/wyszukiwanie. Rozbicie kosztu liczone inline w logu (per-etap).

// POST /api/hs-code/suggest
router.post('/suggest', async (req, res, next) => {
  try {
    // 1. Walidacja kształtu wejścia.
    const parsed = suggestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
    }

    // 2. Sanityzacja opisu (przed jakimkolwiek wywołaniem API).
    let description
    try {
      description = sanitizeInput(parsed.data.description)
    } catch (e) {
      if (e instanceof ValidationError) return res.status(400).json({ error: e.message })
      throw e
    }

    const countryFrom = parsed.data.countryFrom.toUpperCase()
    const countryTo = parsed.data.countryTo.toUpperCase()
    const fromEU = isEU(countryFrom)
    const toEU = isEU(countryTo)
    const domains = !toEU ? officialTariffSources[countryTo] || null : null
    const wantDestination = !!domains

    // 3. Cache — trafienie = zero wywołań API.
    const key = cacheKey(description, countryFrom, countryTo)
    const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000)
    const hit = await prisma.hsSuggestionCache.findUnique({ where: { key } })
    if (hit && hit.createdAt >= cutoff) {
      return res.json({ ...hit.result, cached: true })
    }

    // 4. Kandydaci z cn_codes (zapytanie do bazy, bez kosztu API).
    //    nadanie w UE → CN8 (8 cyfr); nadanie spoza UE → tylko HS-6.
    const candidates = await findCandidates(prisma, description, { hs6: !fromEU })

    let suggestions = []
    let classifyUsage = null
    if (candidates.length) {
      // Rate-limit Etapu 1a konsumujemy dopiero gdy naprawdę wołamy model.
      const rl = tryConsume(req.userId, 'classify')
      if (!rl.ok) {
        return res.status(429).json({
          error: `Przekroczono limit wyszukiwań kodu celnego. Spróbuj ponownie za około ${Math.ceil(rl.retryAfter / 60)} min.`,
          retryAfter: rl.retryAfter,
        })
      }
      const out = await classifyFromCandidates({ description, candidates })
      suggestions = out.suggestions
      classifyUsage = out.usage
    }

    // 5. Etap 1b — kod kraju docelowego (tylko gdy poza UE i mamy dozwolone źródło).
    let destination = null
    let destinationReason = null
    let webUsage = null
    let usedWebSearch = false
    if (wantDestination) {
      const rl = tryConsume(req.userId, 'websearch')
      if (!rl.ok) {
        return res.status(429).json({
          error: `Przekroczono limit wyszukiwań w taryfach zagranicznych. Spróbuj ponownie za około ${Math.ceil(rl.retryAfter / 60)} min.`,
          retryAfter: rl.retryAfter,
        })
      }
      usedWebSearch = true
      const out = await searchDestinationCode({ description, countryTo, domains })
      webUsage = out.usage
      if (out.destinationCode) {
        // out.destinationCode niesie już `verified` (true = potwierdzone źródło,
        // false = niezweryfikowany szacunek modelu). Frontend renderuje na tej podstawie.
        destination = {
          ...out.destinationCode,
          country: countryTo,
          countryName: COUNTRY_NAMES_PL[countryTo] || countryTo,
          systemName: TARIFF_SYSTEM_NAMES[countryTo] || null,
        }
      } else {
        // Model nie był w stanie podać nawet szacunku.
        destinationReason = out.reason || 'brak_szacunku'
      }
    } else if (!toEU) {
      // Poza UE, ale brak dozwolonego źródła taryfowego → web_search nie wołany wcale.
      destinationReason = 'brak_zrodla_dla_kraju'
    }

    const result = {
      fromEU,
      toEU,
      suggestions,
      hs6: suggestions[0] ? suggestions[0].code.slice(0, 6) : null,
      destination,
      destinationReason,
      destinationCountry: !toEU ? COUNTRY_NAMES_PL[countryTo] || countryTo : null,
    }

    // 6. Zapis do cache (upsert po kluczu).
    await prisma.hsSuggestionCache.upsert({
      where: { key },
      create: { key, description, countryFrom, countryTo, result, usedWebSearch },
      update: { result, usedWebSearch, createdAt: new Date() },
    })

    // Log kosztowy (bez danych osobowych — opis to tekst produktu). Rozbicie per-etap:
    // 1a = klasyfikacja (Haiku, bez web_search), 1b = kraj docelowy (Sonnet + web_search).
    const r1a = MODEL_RATES[MODEL_CLASSIFY]
    const cost1a = classifyUsage
      ? ((classifyUsage.input_tokens || 0) * r1a.in + (classifyUsage.output_tokens || 0) * r1a.out) / 1e6
      : 0
    const searches = webUsage?.server_tool_use?.web_search_requests || 0
    const r1b = MODEL_RATES[MODEL_WEB_SEARCH]
    const cost1b = webUsage
      ? ((webUsage.input_tokens || 0) * r1b.in + (webUsage.output_tokens || 0) * r1b.out) / 1e6 + searches * 0.01
      : 0
    console.log('[hs-suggest]', JSON.stringify({
      from: countryFrom,
      to: countryTo,
      description,
      candidates: candidates.length,
      suggested: suggestions.map((s) => s.code),
      destinationCode: destination?.code || null,
      usedWebSearch,
      stage1a: classifyUsage
        ? { model: MODEL_CLASSIFY, input: classifyUsage.input_tokens, output: classifyUsage.output_tokens }
        : null,
      stage1b: webUsage
        ? { model: MODEL_WEB_SEARCH, input: webUsage.input_tokens, output: webUsage.output_tokens, webSearches: searches }
        : null,
      cost1a_usd: Number(cost1a.toFixed(6)),
      cost1b_usd: Number(cost1b.toFixed(6)),
      cost_usd: Number((cost1a + cost1b).toFixed(6)),
    }))

    res.json({ ...result, cached: false })
  } catch (e) {
    next(e)
  }
})

// POST /api/hs-code/log-choice — który kod user faktycznie wybrał („Użyj").
// Zapis od razu (nie odkładany) — bez tego nie da się ocenić skuteczności wyszukiwarki.
router.post('/log-choice', async (req, res, next) => {
  try {
    const parsed = logChoiceSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
    }
    const b = parsed.data
    await prisma.hsChoiceLog.create({
      data: {
        userId: req.userId,
        description: b.description,
        countryFrom: b.countryFrom.toUpperCase(),
        countryTo: b.countryTo.toUpperCase(),
        chosenCode: b.chosenCode,
        source: b.source,
        verified: b.verified ?? null,
        suggestedCodes: b.suggestedCodes,
      },
    })
    res.status(201).json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
