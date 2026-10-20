"""Make the QR code and the printable "scan me" poster.

Run from the project folder:  python3 make_qr.py
(needs the free tool segno:  pip install segno)

Writes web/qr/gca-revise-qr.svg, web/qr/gca-revise-qr.png and web/poster.html.
Open the poster in a browser and print it (A4, portrait).
To point the code somewhere else (say a new domain), change URL below and run again.
"""
from pathlib import Path
import segno

URL = "https://gca-revise.github.io/"
ROOT = Path(__file__).parent
OUT = ROOT / "web" / "qr"
OUT.mkdir(exist_ok=True)

# error="q": the code still scans if a corner is creased or marked.
code = segno.make(URL, error="q")
code.save(OUT / "gca-revise-qr.svg", scale=10, border=4)
code.save(OUT / "gca-revise-qr.png", scale=16, border=4)

POSTER = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GCA Revise poster</title>
<style>
  @font-face {{ font-family: 'Bricolage Grotesque'; src: url(fonts/bricolage-grotesque-latin.woff2) format('woff2'); font-weight: 200 800; }}
  @font-face {{ font-family: 'Figtree'; src: url(fonts/figtree-latin.woff2) format('woff2'); font-weight: 300 900; }}
  @page {{ size: A4 portrait; margin: 0; }}
  html, body {{ margin: 0; background: #fff; }}
  .page {{ width: 210mm; height: 297mm; overflow: hidden; box-sizing: border-box; padding: 12mm 18mm; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; text-align: center; color: #1B2340;
    font-family: 'Figtree', system-ui, sans-serif; border-top: 12mm solid #222C69; }}
  h1 {{ font-family: 'Bricolage Grotesque', sans-serif; font-size: 64pt; line-height: 1; margin: 6mm 0 4mm; color: #222C69; }}
  .sub {{ font-size: 22pt; margin: 0 0 10mm; }}
  .qr {{ width: 110mm; height: 110mm; padding: 3mm; border: 3mm solid #FDE006; border-radius: 6mm; }}
  .qr img {{ width: 100%; height: 100%; display: block; }}
  .scan {{ font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 34pt; margin: 10mm 0 3mm; color: #222C69; }}
  .url {{ font-size: 20pt; font-weight: 600; margin: 0; }}
  .note {{ font-size: 14pt; margin-top: 10mm; color: #4A5272; }}
</style>
</head>
<body>
<div class="page">
  <h1>GCA Revise</h1>
  <p class="sub">Vocabulary, quotes and techniques for your GCSE texts</p>
  <div class="qr"><img src="qr/gca-revise-qr.svg" alt="QR code for {URL}"></div>
  <p class="scan">Scan with your phone camera</p>
  <p class="url">{URL.replace("https://", "").rstrip("/")}</p>
  <p class="note">Free. No sign-up. Your progress is saved on your own device.</p>
</div>
</body>
</html>
"""
(ROOT / "web" / "poster.html").write_text(POSTER, encoding="utf-8")
print("Wrote web/qr/gca-revise-qr.svg, web/qr/gca-revise-qr.png and web/poster.html for", URL)
