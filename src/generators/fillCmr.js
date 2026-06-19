import { fillPdf } from './fillPdf'

/**
 * Wypełnia formularz CMR danymi z wizarda i pobiera PDF.
 *
 * Współrzędne (x, y) są podane względem lewego górnego rogu strony w pikselach PDF.
 * UWAGA: Po wgraniu cmr.pdf do public/templates/eu/land/ trzeba skalibrować
 * współrzędne dla każdego pola — patrz komentarze przy polach.
 */
export async function fillCmr(data) {
  const fields = [
    // ── Pole 1: Nadawca ─────────────────────────────────────────────────────
    { x: 30,  y: 95,  text: data.sender.name },
    { x: 30,  y: 107, text: data.sender.address },
    { x: 30,  y: 119, text: data.sender.country },

    // ── Pole 2: Odbiorca ─────────────────────────────────────────────────────
    { x: 300, y: 95,  text: data.receiver.name },
    { x: 300, y: 107, text: data.receiver.address },
    { x: 300, y: 119, text: data.receiver.country },

    // ── Pole 3: Miejsce dostawy ──────────────────────────────────────────────
    { x: 30,  y: 165, text: `${data.toCity}, ${data.toCountry}` },

    // ── Pole 4: Miejsce i data załadunku ─────────────────────────────────────
    { x: 300, y: 165, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 300, y: 177, text: data.loadDate },

    // ── Pole 9: Nazwa towaru ─────────────────────────────────────────────────
    { x: 30,  y: 285, text: data.cargo.name },

    // ── Pole 10: Kod celny HS/CN ─────────────────────────────────────────────
    { x: 300, y: 285, text: data.cargo.hsCode || '' },

    // ── Pole 11: Waga brutto (kg) ────────────────────────────────────────────
    { x: 30,  y: 325, text: data.cargo.weight ? `${data.cargo.weight} kg` : '' },

    // ── Pole 12: Objętość (m³) ───────────────────────────────────────────────
    { x: 200, y: 325, text: data.cargo.volume ? `${data.cargo.volume} m³` : '' },

    // ── Pole 7: Liczba opakowań ──────────────────────────────────────────────
    { x: 380, y: 325, text: data.cargo.packages ? String(data.cargo.packages) : '' },

    // ── Pole 13: Instrukcje / uwagi ──────────────────────────────────────────
    { x: 30,  y: 365, text: data.cargo.notes || '' },

    // ── Pole 21: Wystawiono w / data wystawienia ─────────────────────────────
    { x: 30,  y: 520, text: `${data.fromCity}, ${new Date().toLocaleDateString('pl-PL')}` },
  ]

  await fillPdf('/templates/eu/land/cmr.pdf', fields, 'CMR.pdf')
}
