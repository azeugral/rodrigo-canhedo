"""Texturas sem emenda (ruído filtrado por FFT é periódico): papel de aquarela e parede."""
import numpy as np
from PIL import Image
rng = np.random.default_rng(3)
N = 512
def ruido(escala, pot=1.0):
    f = np.fft.fft2(rng.standard_normal((N, N)))
    ky, kx = np.meshgrid(np.fft.fftfreq(N), np.fft.fftfreq(N), indexing='ij')
    k = np.sqrt(kx**2 + ky**2) + 1e-6
    f *= np.exp(-(k * escala) ** 2) / k**pot
    r = np.real(np.fft.ifft2(f)); return (r - r.mean()) / r.std()
# papel: granulado de aquarela (bolhas médias) + fibra fina
grao = .35 * ruido(10, .3) + .4 * ruido(3, .1) + .25 * rng.standard_normal((N, N))
base = np.array([235, 227, 209], float)
img = base + grao[..., None] * np.array([3.2, 3.3, 3.6])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('assets/img/papel.webp', quality=82)
# parede: verde-oliva escuro, manchado
m = .7 * ruido(40, .9) + .3 * ruido(8, .3)
base = np.array([33, 38, 31], float)
img = base + m[..., None] * np.array([3.2, 3.4, 3.0])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('assets/img/parede.webp', quality=82)
print('ok')
