"""Gera og.jpg (1200×630) com a folha do hero e o nome. Uso: python tools/og.py"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(R, 'assets')
W, H = 1200, 630
og = Image.open(os.path.join(A, 'img', 'parede.webp')).convert('RGB')
og = og.resize((W, round(og.height * W / og.width))).crop((0, 0, W, H)) if og.width < og.height * W / H else og.resize((round(og.width * H / og.height), H)).crop((0, 0, W, H))
og = Image.blend(og, Image.new('RGB', (W, H), (22, 19, 15)), .35)
folha = Image.open(os.path.join(A, 'hero', 'flash-143.webp')).convert('RGB')
fh = 520; folha = folha.resize((round(folha.width * fh / folha.height), fh), Image.LANCZOS)
fol = folha.convert('RGBA').rotate(-3, expand=True, resample=Image.BICUBIC)
sombra = Image.new('RGBA', fol.size, (0, 0, 0, 0)); sombra.putalpha(fol.getchannel('A').point(lambda a: a * .55))
sombra = sombra.filter(ImageFilter.GaussianBlur(14))
x, y = W - fol.width - 70, (H - fol.height) // 2
og.paste((0, 0, 0), (x + 14, y + 18), sombra); og.paste(fol, (x, y), fol)
d = ImageDraw.Draw(og)
ultra = os.path.join(R, '..', '_ref', 'Ultra-Regular.ttf')
f1 = ImageFont.truetype(ultra, 92)
for i, t in enumerate(['Rodrigo', 'Canhedo']):
    ty = 200 + i * 108
    for dx, c in [(8, (22, 19, 15)), (4, (196, 47, 29)), (0, (235, 227, 209))]:
        d.text((70 + dx, ty + dx), t, font=f1, fill=c)
fb = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
txt = 'TATUADOR · ÁGUAS CLARAS – DF'
tw = d.textlength(txt, font=fb)
d.polygon([(70, 128), (70 + tw + 56, 128), (70 + tw + 40, 150), (70 + tw + 56, 172), (70, 172), (86, 150)], fill=(196, 47, 29))
d.text((70 + 28, 137), txt, font=fb, fill=(235, 227, 209))
fr = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 26)
d.text((70, 450), 'Tradicional americano e flash pintado à mão.', font=fr, fill=(214, 205, 186))
og.save(os.path.join(R, 'og.jpg'), quality=86)
print('ok')
