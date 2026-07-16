// Wersja szablonów JSX używanych do generowania PDF. Zapisywana przy KAŻDYM
// zestawie dokumentów (DocumentSet.templateVersion). Zabezpieczenie na przyszłe
// zmiany w szablonach: pozwoli wykryć, że stary set był generowany inną wersją.
//
// Podbijaj przy każdej zmianie kształtu danych szablonów (docs/slownik_zmiennych.md)
// lub istotnej zmianie wyglądu wpływającej na regenerację.
export const TEMPLATE_VERSION = '1.0.0'
