from pathlib import Path
from PIL import Image, ImageOps
import urllib.request, re

ROOT = Path(__file__).parent
OUT = ROOT / 'dist' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
assets = {
    'hostgator-talk': r'C:\Users\renan\AppData\Local\Temp\codex-clipboard-5d354fc3-b3cf-47f7-9998-d2d9a3a632d4.png',
    'hostgator-studio': r'C:\Users\renan\AppData\Local\Temp\codex-clipboard-22eaec93-73fa-44e3-8b45-abdba6dbbbd3.png',
    'fontesan': ROOT / 'review' / 'fontesan.jpg',
    'octobox-finance': r'D:\Octobox\octobox\static\images\landing\financeiro-real.png',
    'octobox-mobile': r'D:\Octobox\octobox\docs\screenshots\student-app-home-dark.png',
    'curva-exercise': r'D:\Octobox\octobox\.codex\previews\curva-demo-guided-exercise.png',
    'curva-rest': r'D:\Octobox\octobox\.codex\previews\curva-demo-guided-rest.png',
}
for name, source in assets.items():
    im = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    im.thumbnail((1500, 1800))
    im.save(OUT / (name + '.webp'), quality=86, method=6)
    print(name, im.size, (OUT / (name + '.webp')).stat().st_size)

# Download only the Latin and Latin-extended fonts; self-host for visitor privacy.
url = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap'
req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'})
css = urllib.request.urlopen(req).read().decode()
blocks = re.findall(r'/\* (latin(?:-ext)?) \*/\s*(@font-face\s*\{.*?\})', css, re.S)
font_css, downloaded = [], {}
for subset, block in blocks:
    src = re.search(r'url\(([^)]+)\)', block).group(1)
    if src not in downloaded:
        name = 'font-' + str(len(downloaded)+1) + '.woff2'
        (OUT / name).write_bytes(urllib.request.urlopen(src).read())
        downloaded[src] = name
    font_css.append(block.replace(src, downloaded[src]))
(OUT / 'fonts.css').write_text('\n'.join(font_css), encoding='utf-8')
