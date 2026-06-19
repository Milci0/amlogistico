# AmLogistico — Platforma do generowania dokumentów spedycyjnych

## Co to za projekt
Aplikacja webowa do automatycznego generowania dokumentów transportowych 
(CMR, Packing List, Faktura handlowa, SAD, Sea Waybill i inne — docelowo 9+ 
typów). Użytkownik wypełnia formularz 4-krokowy (typ transportu, trasa, 
towar, dane firm) i otrzymuje komplet PDF-ów dopasowany do trasy 
(UE / poza UE) i typu transportu (drogowy/morski).

## Stack
- Frontend: React.js + Tailwind CSS + React Router
- Backend (jeszcze nie zaczęty): Node.js + Express, REST API
- Baza danych (jeszcze nie zaczęta): PostgreSQL + Prisma/Sequelize
- Generowanie PDF: PDFKit
- Płatności: Stripe

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

### Część 1 — Frontend: ~60-70% gotowe
Zrobione:
- Landing Page (hero, karty zalet, lista dokumentów, "jak to działa", 
  cennik, stopka)
- Layout po zalogowaniu: menu boczne (Dashboard, Nowy dokument, Historia, 
  Moje firmy, Abonament, Ustawienia)
- Dashboard z metrykami i tabelą dokumentów
- Formularz "Nowy dokument" — 4 kroki (Trasa, Towar, Strony, Dokumenty)
- Strona "Moje firmy"

Do zrobienia / niesprawdzone:
- Historia dokumentów (strona może nie istnieć)
- Panel abonamentu
- Ekran wynikowy po wygenerowaniu dokumentów (lista PDF + ZIP)
- CountrySelect z flagami, AlertBox o dokumentach celnych
- Prawdziwe strony Rejestracja/Logowanie (obecnie "Zaloguj się" to atrapa, 
  od razu przenosi do dashboardu)

Cała aplikacja na tym etapie działa na DANYCH MOCKOWANYCH — bez 
prawdziwego backendu i bazy danych.

### Część 2 — Backend: 0%, nie zaczęte

### Część 3 — Baza danych: 0%, nie zaczęte

## Zasady pracy
- Pracujemy etapami — najpierw dokończ frontend (MVP na danych mockowanych), 
  dopiero potem przechodzimy do backendu i bazy
- Przed większymi zmianami przedstaw krótki plan zanim zaczniesz pisać kod
- Po zakończeniu sesji zaktualizuj sekcję "AKTUALNY STATUS" powyżej