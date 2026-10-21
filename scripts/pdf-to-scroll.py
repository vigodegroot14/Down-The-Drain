"""Create a self-contained, scrollable HTML rendition of the supplied PDF."""
import base64
import html
from pathlib import Path
import sys

import pymupdf

source = Path(sys.argv[1])
target = Path(sys.argv[2])
labels = [
    'Down the Drain', 'Voorwoord', 'Voorstel',
    'Abandoned Bathtub', 'Abandoned Bathtub: uitwerking',
    'Abandoned Bathtub: moodboard', 'Diggy Drain',
    'Diggy Drain: uitwerking', 'Diggy Drain: moodboard',
    'Wet Groovy Disco', 'Croud performance', 'Tot het volgende avontuur',
    'Het team van Down the Drain',
]
sections = []
with pymupdf.open(source) as doc:
    for number, page in enumerate(doc):
        title = labels[number] if number < len(labels) else f'Pagina {number + 1}'
        home_link = ''
        if number == 11:
            # Isolate this page so removing its raster logo cannot affect other pages.
            closing = pymupdf.open()
            closing.insert_pdf(doc, from_page=number, to_page=number)
            page = closing[0]
            for item in page.get_images():
                rects = page.get_image_rects(item[0])
                if any(abs(rect.x0 - 477.113) < 1 and abs(rect.width - 486) < 1 for rect in rects):
                    page.delete_image(item[0])
            home_link = (
                '<a class="home-logo" href="index.html#top" '
                'aria-label="Terug naar de homepage van Down the Drain" '
                'title="Terug naar de homepage">'
                '<img src="assets/images/web/drain-logo-round-large.png" '
                'alt="Down the Drain" width="768" height="768"></a>'
            )
        svg = page.get_svg_image(text_as_path=True)
        data = base64.b64encode(svg.encode()).decode()
        text = page.get_text().strip()
        description = title + ('. ' + ' '.join(text.split()) if text else '')
        loading = 'eager' if number == 0 else 'lazy'
        sections.append(
            f'<section id="pagina-{number + 1}" aria-label="{html.escape(title, quote=True)}">'
            f'<img src="data:image/svg+xml;base64,{data}" '
            f'width="{int(page.rect.width)}" height="{int(page.rect.height)}" '
            f'alt="{html.escape(description, quote=True)}" loading="{loading}" decoding="async">'
            f'{home_link}'
            '</section>'
        )

document = '''<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#10172a">
  <meta name="description" content="Down the Drain — het conceptboek als doorlopende scrollpagina.">
  <title>Down the Drain — Conceptboek</title>
  <link rel="icon" href="assets/images/web/drain-logo-round.png" type="image/png" sizes="192x192">
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; background: #fff; }
    body { margin: 0; }
    main, section { width: 100%; margin: 0; padding: 0; }
    section { line-height: 0; }
    img { display: block; width: 100%; height: auto; }
    #pagina-12 { position: relative; }
    .home-logo { position: absolute; left: 40%; top: 34%; width: 20%;
      display: block; border-radius: 50%; }
    .home-logo img { border-radius: 50%; animation: home-logo-spin 16.36s linear infinite; }
    @keyframes home-logo-spin { to { transform: rotate(360deg); } }
    .top { position: fixed; right: 16px; bottom: 16px; z-index: 2;
      padding: 12px 16px; border: 1px solid #ffffff80; border-radius: 30px;
      background: #10172ae6; color: white; text-decoration: none;
      font: 14px/1.2 system-ui, sans-serif; box-shadow: 0 2px 12px #0002; }
    .top:hover { background: #254ae0; }
    a:focus-visible { outline: 3px solid #f4c542; outline-offset: 3px; }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .home-logo img { animation: none; }
    }
    @media print { .top { display: none; } section { break-inside: avoid; } }
  </style>
</head>
<body id="boven">
  <main aria-label="Down the Drain conceptboek">
SECTIONS
  </main>
  <a class="top" href="#boven" aria-label="Terug naar het begin">↑ Naar boven</a>
</body>
</html>
'''.replace('SECTIONS', '\n'.join(sections))
target.write_text(document, encoding='utf-8')
print(f'Created {target}: {len(sections)} pages, {target.stat().st_size / 1024 / 1024:.1f} MB')
