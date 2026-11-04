"""Verify static routes and assets before deployment; no outbound actions."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

root = Path(__file__).parent / 'dist'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=set(); self.h1=0; self.images=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='img': self.images.append(a)
        if tag in ('a','link','script','img'):
            for key in ('href','src'):
                if a.get(key): self.refs.append(a[key])

pages={}
for path in root.rglob('*.html'):
    p=Page(); p.feed(path.read_text(encoding='utf-8')); pages[path.resolve()]=p
errors=[]
for path,p in pages.items():
    if p.h1 != 1: errors.append(f'{path}: h1 count={p.h1}')
    for img in p.images:
        if not img.get('alt'): errors.append(f'{path}: missing alt')
    for ref in p.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        target = (root / unquote(u.path).lstrip('/')) if u.path.startswith('/') else path.parent / unquote(u.path)
        if not u.path: target=path
        if target.is_dir(): target=target / 'index.html'
        if not target.is_file(): errors.append(f'{path}: missing {ref}')
        elif u.fragment and target.suffix=='.html' and u.fragment not in pages[target.resolve()].ids:
            errors.append(f'{path}: missing anchor {ref}')
assert not errors, '\n'.join(errors)
print(f'PASS: {len(pages)} pages; all internal links, anchors, assets, H1s and image alternatives.')
