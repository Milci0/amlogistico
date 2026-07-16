# AmLogistico — notatka dla `src/`

> **Źródłem prawdy jest główny [`/CLAUDE.md`](../CLAUDE.md) w roocie projektu.**
> Ten plik wcześniej duplikował status i zdążył się zdezaktualizować (twierdził
> „backend 0%", pliki `fill*.js` itp.) — celowo zredukowany do wskaźnika, żeby nie
> było dwóch rozjeżdżających się opisów.

Skróty istotne przy pracy w `src/`:
- Generowanie PDF: silnik `src/generators/generatePdf.jsx`, rejestr dokumentów
  `src/generators/documents.js` (`DOCUMENTS`, `getDocsList`, `generateDocument`),
  szablony JSX w `src/generators/templates/eu/{common,land,sea}/`. Plików `fill*.js` już nie ma.
- Persystencja zestawów: `src/services/documentSetsRepo.js` (woła REST `/api/document-sets`,
  funkcje async), słownik pól szablonów: `docs/slownik_zmiennych.md`.
- Auth: `src/auth/AuthContext.jsx` + `src/lib/api.js` (httpOnly cookie, `credentials:'include'`).

Po zmianach aktualizuj sekcję „AKTUALNY STATUS" w głównym `/CLAUDE.md`, nie tutaj.
