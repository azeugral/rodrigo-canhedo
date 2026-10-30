"""Escreve no index.html os blocos de Tatuagens e Do papel pra pele (entre os marcadores)."""
import os, re, json, html
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(RAIZ, 'assets')
import importlib.util
spec = importlib.util.spec_from_file_location('p', os.path.join(RAIZ, 'tools', 'processar_dados.py'))
p = importlib.util.module_from_spec(spec); spec.loader.exec_module(p)

def dim(f):
    return Image.open(os.path.join(RAIZ, f)).size

t = []
for i, (f, leg) in enumerate(p.TATUAGENS):
    w, h = dim(f'assets/tattoo/{f}-640.webp')
    t.append(f'    <figure class="obra revela" style="--i:{i % 4}"><img src="assets/tattoo/{f}-640.webp" data-grande="assets/tattoo/{f}-1400.webp" alt="Tatuagem tradicional: {html.escape(leg.lower())}" width="{w}" height="{h}" loading="lazy" data-zoom><figcaption>{html.escape(leg)}</figcaption></figure>')
pr = []
for i, (fl, tt, leg) in enumerate(p.PARES):
    w, h = dim(f'assets/pares/{tt}-760.webp'); w2, h2 = dim(f'assets/pares/{fl}-760.webp')
    pr.append(f'''    <button class="par revela" type="button" style="--i:{i % 4}" aria-pressed="false" aria-label="{html.escape(leg)}: alternar entre tatuagem e flash">
      <img class="par-pele" src="assets/pares/{tt}-760.webp" alt="Tatuagem de {html.escape(leg.lower())}" width="{w}" height="{h}" loading="lazy">
      <img class="par-papel" src="assets/pares/{fl}-760.webp" alt="Flash de {html.escape(leg.lower())} que deu origem à tatuagem" width="{w2}" height="{h2}" loading="lazy">
      <span class="par-leg"><b>{html.escape(leg)}</b><i class="par-pele-t">na pele</i><i class="par-papel-t">no papel</i></span>
    </button>''')
s = open(os.path.join(RAIZ, 'index.html'), encoding='utf8').read()
def troca(s, nome, bloco):
    return re.sub(rf'<!--{nome}-->.*?<!--/{nome}-->|<!--{nome}-->', f'<!--{nome}-->\n' + bloco + f'\n<!--/{nome}-->', s, count=1, flags=re.S)
s = troca(s, 'TATUAGENS', '\n'.join(t)); s = troca(s, 'PARES', '\n'.join(pr))
open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf8', newline='\n').write(s)
print(len(t), len(pr))
