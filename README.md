# Auto-servis M&K — web

Statická stránka (HTML + CSS + vanilla JS), bez build kroku. Otvorte `index.html` alebo nahrajte celý priečinok na hosting.

```
index.html          obsah, SEO, JSON-LD
css/tokens.css      farby, písma, rozostupy (menia sa tu)
css/base.css        reset, typografia, utility, animácia hero
css/components.css  tlačidlá, hlavička, menu, stav otvorené/zatvorené, pätka
css/sections.css    hero, služby, o servise, prečo M&K, kontakt, hodiny + poloha
js/main.js          menu, otváracie hodiny, koleso v hero, kopírovanie čísla
assets/             wheel.svg, hub-detail.svg, contours.svg, favicon.svg
```

## Čo upraviť pred nasadením
- **Fotografie**: hero (`assets/wheel.svg`) a „O servise“ (`assets/hub-detail.svg`) sú technické výkresy. Ak budú reálne fotky dielne, vymeňte súbory v `<img>` — CSS sa postará o orezanie.
- **Otváracie hodiny**: menia sa na 3 miestach — `HOURS` v `js/main.js`, sekcia hodín + pätka v `index.html`, JSON-LD v `<head>`.
- **Open Graph**: doplňte `og:url` a `og:image` (absolútna URL, 1200×630 px) po nasadení na doménu.
- **Písma (GDPR)**: písma sa načítavajú z Google Fonts. Pre plne lokálne hostovanie stiahnite *Big Shoulders Display* (700–900) a *Archivo* (variabilný, os wdth + wght) a nahraďte `<link>` v `index.html` vlastným `@font-face`.
- **E-mail / sociálne siete**: zámerne chýbajú, keďže neboli zadané.
