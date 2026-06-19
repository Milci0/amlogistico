# AmLogistico — Platforma do generowania dokumentów spedycyjnych

## Co to za projekt
Aplikacja webowa do automatycznego generowania dokumentów transportowych
(CMR, Packing List, Faktura handlowa, SAD, Sea Waybill i inne — docelowo 9+ typów).
Użytkownik wypełnia formularz 4-krokowy (typ transportu, trasa, towar, dane firm)
i otrzymuje komplet PDF-ów dopasowany do trasy (UE / poza UE) i typu transportu (drogowy/morski).

## Stack
- **Frontend:** React.js + Tailwind CSS + React Router (w folderze `src/`)
- **Backend:** Node.js + Express, REST API (w folderze `server/`)
- **Baza danych:** PostgreSQL + Prisma (jeszcze nie zaczęta)
- **Generowanie PDF:** PDFKit
- **Płatności:** Stripe

## Szczegółowy plan techniczny — docs/
Sięgaj do tych plików gdy potrzebujesz konkretów (pola dokumentów, endpointy, schemat bazy):
- `docs/1.Frontend.md` — struktura stron, komponenty, nawigacja
- `docs/2.Backend.md` — endpointy API, logika doboru dokumentów, pola CMR/SAD/Packing List
- `docs/3.Baza danych.md` — schemat tabel, relacje, zasady przechowywania danych

## AKTUALNY STATUS

### Frontend: ~65% gotowe
**Zrobione:**
- Landing Page (hero z przyciskiem "Rozpocznij", wizard modal, karty zalet, cennik, stopka)
- 4-krokowy wizard (Trasa → Towar → Strony → Dokumenty) z paskiem kroków, walidacją
- Layout po zalogowaniu: Navbar, Sidebar, AppShell
- Dashboard z metrykami i tabelą dokumentów (dane mockowane)
- Strony: Historia, Moje firmy, Abonament, Ustawienia (szkielet)

**Do zrobienia:**
- Ekran wynikowy po kliknięciu "Generuj" (lista PDF + przyciski pobierania)
- Prawdziwe strony Rejestracja/Logowanie
- Panel abonamentu (integracja ze Stripe)
- Podmiana `NewDocumentPage` na `DocumentWizard`

### Backend: 0% — w budowie
Folder `server/` — Node.js + Express na porcie 3001.

### Baza danych: 0% — nie zaczęta

## Zasady pracy
- Przed większymi zmianami przedstaw krótki plan
- Po zakończeniu sesji zaktualizuj sekcję "AKTUALNY STATUS"
- Logika doboru dokumentów (TIR+EU vs TIR+poza-UE vs Morski) jest w `docs/2.Backend.md`
- Lista krajów UE: stała `EU_CODES` w `src/components/wizard/DocumentWizard.jsx`
