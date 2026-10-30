"""Gera as texturas do hero: para cada flash, a arte (webp) e o mapa de tempo (webp sem perda).
Mapa: R = ordem do traço preto (0..1), G = ordem da cor (0..1), B = 255 onde é papel.
Uso: python tools/hero.py   (lê _ref/pinterest2/digital, grava assets/hero)"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.graph import MCP_Geometric

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(RAIZ, '..', '_ref', 'pinterest2', 'digital')
OUT = os.path.join(RAIZ, 'assets', 'hero')
FLASHES = sys.argv[1:] or ['143', '149', '140', '136']
W, H = 1024, 1280
MW, MH = 512, 640
rng = np.random.default_rng(7)

def geodesica(mask, semente):
    custo = np.where(mask, 1.0, np.inf)
    m = MCP_Geometric(custo)
    d, _ = m.find_costs([semente])
    d[~mask] = 0
    return d

for nome in FLASHES:
    im = Image.open(os.path.join(REF, nome + '.jpg')).convert('RGB').resize((W, H), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    borda = np.concatenate([a[:20].reshape(-1, 3), a[-20:].reshape(-1, 3), a[:, :20].reshape(-1, 3), a[:, -20:].reshape(-1, 3)])
    fundo = np.median(borda, 0)
    suave = ndi.gaussian_filter(a, (2.2, 2.2, 0))
    luma = suave @ np.array([.299, .587, .114])
    dist = np.linalg.norm(suave - fundo, axis=2)
    sat = suave.max(2) - suave.min(2)
    preto = (luma < .22) & (sat < .28)
    papel = (dist < .085) & ~preto
    preto = ndi.binary_opening(preto, iterations=1)
    cor = ~papel & ~preto
    cor = ndi.binary_opening(cor, iterations=2)
    # reduz para o mapa
    def red(m):
        return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((MW, MH), Image.BILINEAR)) > 100
    p_m, c_m = red(preto), red(cor)
    papel_m = ~p_m & ~c_m
    # traço: componentes de cima para baixo, cada um percorrido a partir do ponto mais alto
    t_lin = np.ones((MH, MW), np.float32)
    lab, n = ndi.label(p_m, np.ones((3, 3)))
    objs = ndi.find_objects(lab)
    tam = ndi.sum(p_m, lab, range(1, n + 1))
    ordem = sorted(range(n), key=lambda i: objs[i][0].start + objs[i][1].start * .15)
    total = sum(np.sqrt(tam[i]) for i in ordem) or 1
    ini = 0.0
    for i in ordem:
        mk = lab == i + 1
        ys, xs = np.nonzero(mk)
        k = np.argmin(ys * 4 + xs * .01)
        dur = np.sqrt(tam[i]) / total
        if tam[i] < 25:
            t_lin[mk] = ini
        else:
            d = geodesica(mk, (ys[k], xs[k]))
            d = d / (d[mk].max() or 1)
            t_lin[mk] = ini + d[mk] * dur * 1.9
        ini += dur * .62
    t_lin = np.clip(t_lin / max(t_lin[p_m].max(), 1e-3), 0, 1) * p_m + (~p_m)
    # cor: cada região espalha a partir do miolo, regiões em ordem de cima para baixo com sobreposição
    t_cor = np.ones((MH, MW), np.float32)
    lab, n = ndi.label(c_m)
    objs = ndi.find_objects(lab)
    ordem = sorted(range(n), key=lambda i: objs[i][0].start + rng.uniform(0, 60))
    for j, i in enumerate(ordem):
        mk = lab == i + 1
        dt = ndi.distance_transform_edt(mk)
        y, x = np.unravel_index(np.argmax(dt), dt.shape)
        d = geodesica(mk, (y, x))
        d = d / (d[mk].max() or 1)
        ini = j / max(n, 1) * .55
        t_cor[mk] = ini + np.sqrt(d[mk]) * .45
    t_cor = np.clip(t_cor, 0, 1) * c_m + (~c_m)
    # áreas pretas também ganham um "tempo de cor" para a pincelada de sombra (usa o do traço)
    mapa = np.dstack([t_lin * 255, t_cor * 255, papel_m * 255]).astype(np.uint8)
    mapa = ndi.median_filter(mapa, size=(3, 3, 1))
    Image.fromarray(mapa).save(os.path.join(OUT, f'mapa-{nome}.webp'), lossless=True)
    im.save(os.path.join(OUT, f'flash-{nome}.webp'), quality=90)
    im.resize((640, 800), Image.LANCZOS).save(os.path.join(OUT, f'flash-{nome}-640.webp'), quality=86)
    print(nome, 'fundo', (fundo * 255).round(), 'traços', n)
json.dump(FLASHES, open(os.path.join(OUT, 'lista.json'), 'w'))
