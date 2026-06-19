# AmLogistico — Platforma do generowania dokumentów spedycyjnych

## Co to za projekt
Aplikacja webowa do automatycznego generowania dokumentów transportowych 
(CMR, Packing List, Faktura handlowa, SAD, Sea Waybill i inne — docelowo 9+ 
typów). Użytkownik wypełnia formularz 4-krokowy (typ transportu, trasa, 
towar, dane firm) i otrzymuje komplet PDF-ów dopasowany do trasy 
(UE / poza UE) i typu transportu (drogowy/morski).

## Stack
- Frontend: React.js + Tailwind CSS + React Router
- Backend: Node.js + Express, REST API — nie zaczęty
- Baza danych: PostgreSQL + Prisma — nie zaczęta
- Generowanie PDF: html2pdf.js z CDN (po stronie przeglądarki, szablony JSX)
- Płatności: Stripe — nie zaczęte

## Pełny plan techniczny — szczegóły w docs/
Pełny opis każdej części znajduje się w trzech plikach:
- `docs/plan_czesc1_frontend.docx` — struktura stron, komponenty, nawigacja
- `docs/plan_czesc2_backend.docx` — endpointy API, logika doboru dokumentów, 
  autoryzacja, Stripe
- `docs/plan_czesc3_baza_danych.docx` — schemat tabel, pola każdego 
  dokumentu (CMR, SAD, Packing List itd.), relacje

Sięgaj do tych plików, gdy potrzebujesz konkretów (np. dokładnej listy pól 
dokumentu, nazwy endpointu, struktury tabeli) — nie zgaduj na podstawie 
samego streszczenia poniżej.

## AKTUALNY STATUS (aktualizuj po każdej sesji!)

### Część 1 — Frontend: ~80% gotowe
Zrobione:
- Landing Page (hero, karty zalet, lista dokumentów, "jak to działa", 
  cennik, stopka)
- Layout po zalogowaniu: menu boczne (Dashboard, Nowy dokument, Historia, 
  Moje firmy, Abonament, Ustawienia)
- Dashboard z metrykami i tabelą dokumentów
- Formularz "Nowy dokument" — 4 kroki (Trasa, Towar, Strony, Dokumenty)
- Strona "Moje firmy"
- Generowanie PDF po stronie przeglądarki (html2pdf.js z CDN):
  - `src/generators/generatePdf.jsx` — core utility (React → html2canvas → PDF)
  - `src/generators/templates/` — 9 szablonów JSX dopasowanych do PDF wzorców
  - `src/generators/fill*.js` — 9 plików, wszystkie używają generatePdf
  - WAŻNE: element musi być na position:fixed;top:0;left:0;z-index:-9999
    (nie left:-9999px — html2canvas wymaga elementu w viewport)
- Step 4 wizarda: sekcje Wymagane/Opcjonalne, przycisk PDF per dokument
  (stany idle/loading/done/error), 2 przyciski zbiorcze
- Branding: AMLogistico w Navbar/Sidebar/AppShell/Footer
- Oryginalne PDF wzorce w `public/templates/eu/` (land/, sea/, common/)

Do zrobienia:
- Prawdziwe strony Rejestracja/Logowanie (atrapa → od razu dashboard)
- Panel abonamentu (integracja ze Stripe)
- Podmiana NewDocumentPage na DocumentWizard w routingu

### Część 2 — Backend: 0%, nie zaczęty

### Część 3 — Baza danych: 0%, nie zaczęta

## Zasady pracy
- Pracujemy etapami — najpierw dokończ frontend (MVP na danych mockowanych), 
  dopiero potem przechodzimy do backendu i bazy
- Przed większymi zmianami przedstaw krótki plan zanim zaczniesz pisać kod
- Po zakończeniu sesji zaktualizuj sekcję "AKTUALNY STATUS" powyżej