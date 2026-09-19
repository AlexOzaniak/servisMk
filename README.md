# Auto-servis M&K — web

Statická stránka (HTML + CSS + vanilla JS), bez build kroku. Otvorte `index.html` alebo nahrajte celý priečinok na hosting.

```
index.html          obsah, SEO, JSON-LD
404.html            stránka pre neexistujúce URL (funguje na Netlify/Vercel/Apache/nginx s malým nastavením)
robots.txt          povolenie pre vyhľadávače + odkaz na sitemap
sitemap.xml         mapa stránky pre Google/Bing
site.webmanifest    ikona a názov pri "Pridať na plochu" (mobil)
css/tokens.css      farby, písma, rozostupy (menia sa tu)
css/base.css        reset, typografia, utility, animácia hero
css/components.css  tlačidlá, hlavička, menu, stav otvorené/zatvorené, pätka
css/sections.css    hero, služby, o servise, prečo M&K, kontakt, hodiny + poloha
js/main.js          menu, otváracie hodiny, koleso v hero, kopírovanie čísla
assets/             wheel.svg, hub-detail.svg, contours.svg, favicon.svg
```

## Čo upraviť pred nasadením
- **Doména**: v `index.html` (canonical, og:url), `robots.txt` a `sitemap.xml` nahraďte `VASA-DOMENA.sk` skutočnou doménou.
- **Fotografie**: hero (`assets/wheel.svg`) a „O servise“ (`assets/hub-detail.svg`) sú technické výkresy. Ak budú reálne fotky dielne, vymeňte súbory v `<img>` — CSS sa postará o orezanie.
- **Otváracie hodiny**: menia sa na 3 miestach — `HOURS` v `js/main.js`, sekcia hodín + pätka v `index.html`, JSON-LD v `<head>`.
- **Open Graph**: doplňte `og:image` (absolútna URL, 1200×630 px) po nasadení na doménu.
- **Písma (GDPR)**: písma sa načítavajú z Google Fonts. Pre plne lokálne hostovanie stiahnite *Big Shoulders Display* (700–900) a *Archivo* (variabilný, os wdth + wght) a nahraďte `<link>` v `index.html` vlastným `@font-face`.
- **404 stránka**: na Netlify/Vercel funguje automaticky. Na Apache/nginx treba nastaviť `ErrorDocument 404 /404.html`, resp. `error_page 404 /404.html;`.
- **E-mail / sociálne siete**: zámerne chýbajú, keďže neboli zadané.
