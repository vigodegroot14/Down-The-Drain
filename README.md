# Down the Drain

Statische website in HTML, CSS en JavaScript. Blauw-witte huisstijl geïnspireerd op de badkuip, betegelde booth en douche op Solar Weekend 2026.

## Openen

Open `index.html` rechtstreeks, gebruik Live Server in VS Code, of start met Node:

```sh
node scripts/preview.mjs
```

Open vervolgens http://127.0.0.1:4173. Geen dependencies of build nodig. De previewserver is alleen lokaal bereikbaar.

## Bestanden

- `index.html`: inhoud, navigatie, aftermovieplek en geselecteerde galerij.
- `css/style.css`: huisstijl, secties en responsive regels. Kleuren en lettertypen staan in `:root`.
- `js/main.js`: mobiel menu, fotogalerij, jaartal en bediening voor een toekomstige aftermovie.
- `js/intro.js`: logo-intro, overslaan, sessiegeheugen en minder beweging.
- `assets/images/web/`: geoptimaliseerde afbeeldingen voor de site.
- `assets/images/web/selection.json`: koppeling tussen webbestanden, originele foto's en afmetingen.
- `scripts/prepare-images.ps1`: genereert de webversies opnieuw met Windows/System.Drawing.
- `scripts/preview.mjs`: lokale previewserver.

De originele foto's in `assets/images/` blijven intact. De site gebruikt alleen de webversies. `.local-preview/` bevat lokale controles en een kopie van de oorspronkelijke code; deze map hoort niet op de publieke website.

## Fotoselectie

11 unieke foto's uit 215 aangeleverde foto's: één op het eerste scherm, twee bij het Solar-verhaal en acht in de galerij. De galerij opent grotere versies met vorige/volgende, pijltjestoetsen en Escape.

| Gebruik | Oorspronkelijk fotonummer | Webnaam |
| --- | --- | --- |
| Hoofdscherm / videoposter | 65 | solar-crowd-hero |
| Badkuipbooth | 122 | solar-bathtub-booth |
| Stage van buiten | 4 | solar-bathhouse |
| Blauwe douche | 23 | solar-blue-shower |
| Publiek en bubbels | 17 | solar-bubbles |
| Achter de decks | 41 | solar-behind-the-decks |
| Vrienden | 60 | solar-friends |
| Badeend | 73 | solar-rubber-duck |
| Avondsfeer | 100 | solar-after-dark |
| Nacht en licht | 108 | solar-night-lights |
| Zeepbellen | 155 | solar-soap-bubbles |

Galerijfoto's zijn beschikbaar op 800, 1600 en 2400 pixels aan de langste zijde en worden met JPEG-kwaliteit 92 geëxporteerd. De foto op het hoofdscherm heeft daarnaast versies van 2560 en 3840 pixels, met JPEG-kwaliteit 94 voor meer detail. De browser kiest via `srcset` en `sizes` de juiste scherpe versie voor het formaat en de pixeldichtheid van het scherm. De bestanden behouden de camerastand en bevatten geen oorspronkelijke metadata. Foto's onder het hoofdscherm laden met `loading="lazy"`.

## Aftermovie toevoegen

1. Maak `assets/video/` en plaats daarin `solar-2026-aftermovie.mp4`.
2. Vervang in `index.html` het volledige `<picture class="hero-media">...</picture>` door:

```html
<video class="hero-media" muted loop playsinline preload="none"
  poster="assets/images/web/solar-crowd-hero-3840.jpg"
  aria-label="Aftermovie Down the Drain op Solar Weekend 2026">
  <source src="assets/video/solar-2026-aftermovie.mp4" type="video/mp4">
</video>
```

3. Verander de tekst `SOLAR '26 — AFTERMOVIE BINNENKORT` naar `SOLAR '26 — THE AFTERMOVIE`.

De tekst en donkere overlay blijven over de video staan. JavaScript voegt automatisch een afspeel-/pauzeknop toe. Na de intro start de film gedempt, wanneer de browser dit toestaat. Bij minder beweging start hij alleen na een klik. Als automatisch afspelen wordt geblokkeerd, blijft de poster staan. Buiten beeld wordt de film gepauzeerd. De pauzeknop is ook via het toetsenbord bereikbaar. Zonder JavaScript blijft de videoposter zichtbaar.

## Inhoud aanvullen

Er zijn geen bevestigde contactgegevens, social-links, nieuwe eventdata of namen van residents aangeleverd. Daarom zijn de voorbeeldnamen, fictieve eventdata en niet-werkende ticket-/Instagramlinks verwijderd.

- Vul in `#events` het echte volgende event met datum, locatie en ticket-URL in. Gebruik voor de datum een `<time datetime="2026-09-21">` met de juiste datum en houd afgelopen events uit deze sectie.
- Vervang in `#contact` de melding door het echte mailadres en eventueel een link naar jullie specifieke Instagram-profiel.
- Voeg residents pas toe met bevestigde namen en de bijbehorende portretten. De huidige galerijfoto's worden niet aan namen gekoppeld.

## Toegankelijkheid en gedrag

De pagina is standaard zichtbaar: scripts voegen alleen interactie toe. Zonder JavaScript blijven alle secties, navigatielinks en fotolinks bruikbaar. Native dialogs houden toetsenbordfocus binnen de intro/galerij. Escape sluit ze en de focus gaat terug naar een logische plek. De intro verschijnt één keer per tab/sessie en wordt bij een directe sectielink overgeslagen. Een nieuw tabblad of gewiste sessieopslag laat de intro opnieuw zien.

De voorkeur `prefers-reduced-motion` schakelt de draai-/zoomanimatie, smooth scroll en CSS-transities uit. Er zijn geen voortdurende tickers, parallax of verborgen reveal-elementen meer.

## Versiebeheer en publiceren

Git is lokaal geïnitialiseerd; er is nog geen commit of remote. `.gitignore` sluit de originele grote fotobestanden, toekomstige video's en lokale previewbestanden uit. De geoptimaliseerde webfoto's kunnen wel in versiebeheer.

Publiceer alleen `index.html`, `css/`, `js/`, `assets/images/web/` en, zodra beschikbaar, `assets/video/`. Upload dus niet de volledige map met originele foto's of de lokale previewmap. Controleer de contact- en eventgegevens vóór publicatie. Google Fonts is de enige externe fontbron; lokale fallbacklettertypen blijven beschikbaar als die bron niet laadt.
