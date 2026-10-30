"""Prepara as imagens do site a partir de _ref (Instagram, Pinterest e destaques).
Uso: python tools/processar.py  (pula o que já existe; apague a saída para refazer)"""
import os, json
from PIL import Image, ImageOps
import pillow_heif
from processar_dados import TATUAGENS, PARES

pillow_heif.register_heif_opener()
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(RAIZ, '..', '_ref')
A = os.path.join(RAIZ, 'assets')


def abrir(p):
    return ImageOps.exif_transpose(Image.open(p)).convert('RGB')


def salvar(im, destino, larg, q=80, lado='w'):
    if os.path.exists(destino):
        return
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im = im.copy()
    if lado == 'w' and im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    elif lado == 'max' and max(im.size) > larg:
        im.thumbnail((larg, larg), Image.LANCZOS)
    im.save(destino, quality=q, method=6)


# catálogo: Pinterest (Flashs = pintados à mão, Flashs 2 = digitais, Flashinhos)
pins = json.load(open(os.path.join(REF, 'pinterest2', 'pins.json'), encoding='utf8'))
PASTA = {'maos': 'M', 'digital': 'D', 'flashinhos': 'P'}
cat = []
cont = {k: 0 for k in PASTA}
for p in pins:
    if p['board'] not in PASTA:
        continue
    cont[p['board']] += 1
    cod = f"{PASTA[p['board']]}-{cont[p['board']]:03d}"
    im = abrir(os.path.join(REF, 'pinterest2', p['file']))
    salvar(im, os.path.join(A, 'catalogo', f'{cod}-560.webp'), 560, 76)
    salvar(im, os.path.join(A, 'catalogo', f'{cod}-1600.webp'), 1600, 80, 'max')
    w, h = im.size
    cat.append({'c': cod, 'p': p['board'], 'r': round(w / h, 3)})
json.dump(cat, open(os.path.join(A, 'catalogo.json'), 'w'), separators=(',', ':'))
print('catálogo', cont)

IG = os.path.join(REF, 'ig')
# portfólio: tatuagens (nome do arquivo do IG, legenda curta)
port = []
for i, (f, leg) in enumerate(TATUAGENS):
    im = abrir(os.path.join(IG, f + '.jpg'))
    salvar(im, os.path.join(A, 'tattoo', f'{f}-640.webp'), 640, 78)
    salvar(im, os.path.join(A, 'tattoo', f'{f}-1400.webp'), 1400, 82, 'max')
    port.append({'f': f, 'l': leg})
json.dump(port, open(os.path.join(A, 'tatuagens.json'), 'w', encoding='utf8'), ensure_ascii=False)

# do papel pra pele: (flash, tatuagem, legenda)
for fl, tt, _ in PARES:
    for f in (fl, tt):
        salvar(abrir(os.path.join(IG, f + '.jpg')), os.path.join(A, 'pares', f'{f}-760.webp'), 760, 80)

# ele
for f, larg in [('027_0', 1400), ('004_0_v', 900), ('005_0_v', 900)]:
    salvar(abrir(os.path.join(IG, f + '.jpg')), os.path.join(A, 'img', f'eu-{f}.webp'), larg, 82)

# loja e projetos (destaques): corta a faixa de texto de baixo
D = os.path.join(REF, 'destaques')
CORTES = {'030': (.23, .73), '017': (.16, .80)}  # o resto: faixa de texto embaixo
for pasta, nomes, corte in [('merch', ['000', '001', '002', '003', '004', '009', '010', '013', '017', '018', '027', '030'], .70),
                            ('projetos', ['1', '2', '3', '4'], .86)]:
    for n in nomes:
        im = abrir(os.path.join(D, pasta, n + '.jpg'))
        w, h = im.size
        a, b = CORTES.get(n, (.05, corte)) if pasta == 'merch' else (.05, corte)
        im = im.crop((0, int(h * a), w, int(h * b)))
        salvar(im, os.path.join(A, pasta, f'{n}-720.webp'), 720, 80)
print('ok')
