import { fillPdf } from './fillPdf'

export async function fillCmr(data) {
  const today = new Date().toLocaleDateString('pl-PL')

  const fields = [
    // ── Nr/No. i Data (prawy górny nagłówek) ────────────────────────────────
    { x: 488, y: 42, text: today },

    // ── Pole 1: Nadawca (lewa kolumna, x=30‒295) ────────────────────────────
    { x: 35,  y: 125, text: data.sender.name },
    { x: 35,  y: 140, text: data.sender.address },
    // Kraj (etykieta "Kraj / Country:" jest w szablonie; wpisujemy wartość po niej)
    { x: 35,  y: 202, text: data.sender.country },

    // ── Pole 2: Odbiorca (prawa kolumna, x=300‒570) ─────────────────────────
    { x: 305, y: 125, text: data.receiver.name },
    { x: 305, y: 140, text: data.receiver.address },
    { x: 305, y: 202, text: data.receiver.country },

    // ── Pole 4: Miejsce i data załadunku (lewy blok wiersza 3) ──────────────
    { x: 35,  y: 308, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 35,  y: 322, text: data.loadDate },

    // ── Pole 5: Miejsce dostawy (środkowy blok wiersza 3) ───────────────────
    { x: 222, y: 308, text: `${data.toCity}, ${data.toCountry}` },

    // ── Tabela towarów (wiersz 1) ────────────────────────────────────────────
    // 8. Liczba opakowań  (x≈108)
    { x: 108, y: 378, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    // 10. Opis towaru     (x≈215)
    { x: 215, y: 378, text: data.cargo.name },
    // 11. Stat/Code HS   (x≈375)
    { x: 375, y: 378, text: data.cargo.hsCode || '' },
    // 12. Waga brutto kg (x≈415)
    { x: 415, y: 378, text: data.cargo.weight ? String(data.cargo.weight) : '' },
    // 13. Objętość m³    (x≈505)
    { x: 505, y: 378, text: data.cargo.volume ? String(data.cargo.volume) : '' },

    // ── Pole 14: Instrukcje nadawcy ──────────────────────────────────────────
    { x: 35,  y: 475, text: data.cargo.notes || '' },

    // ── Pole 22: Miejsce i data wystawienia (lewy blok podpisów) ────────────
    { x: 35,  y: 635, text: `${data.fromCity}, ${today}` },
  ]

  await fillPdf('/templates/eu/land/01_CMR_List_Przewozowy.pdf', fields, 'CMR.pdf')
}
