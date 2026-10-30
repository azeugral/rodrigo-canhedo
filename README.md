# Rodrigo Canhedo · site

Site de apresentação do Rodrigo Canhedo (@rodrigo.canhedo), tatuador de tradicional americano no Space Monkey Tattoo, Águas Claras – DF.

Publicado em: https://azeugral.github.io/rodrigo-canhedo/ (prévia com `noindex` e `robots.txt` bloqueando; liberar quando for pro domínio).

## Estrutura

- `index.html`: página única (hero com a folha sendo pintada, sobre, catálogo, do papel pra pele, tatuagens, serviços, loja, viagens, agendar).
- `assets/js/folha.js`: shader WebGL do hero (esboço → traço preto → aguada de cor → troca de folha). `?p=0.5` congela a fase, `?folha=shader|video` força o modo.
- `assets/hero/folha.mp4`: o mesmo shader gravado, usado no celular (toque ou largura < 900px).
- `assets/catalogo.json`: catálogo vindo das pastas do Pinterest (M = pintados à mão, D = digitais, P = flashinhos).
- `tools/`: scripts que geram tudo a partir de `_ref` (fora do repo):
  - `hero.py` gera os mapas de traço e cor;
  - `processar.py` gera as imagens, rodar sem `-I`;
  - `montar.py` injeta os blocos de tatuagens e pares no HTML;
  - `texturas.py` gera papel e parede;
  - `og.py` gera a imagem de compartilhamento;
  - `gravar_video.mjs` grava o MP4 do hero, com servidor local na porta 8862.

## CONFIRMAR com o cliente

- [ ] **Endereço do Space Monkey Tattoo**: o link do mapa é uma busca por nome. Trocar pelo endereço completo e pelo link do Google Maps do estúdio.
- [ ] **Horário de atendimento**: no site está "atendimento com horário marcado".
- [ ] **"Mais de 13 flashes"**: a frase saiu da transcrição do reel de catálogo; conferir o número.
- [ ] **Tattoo Rock Fest**: falta o ano e a cidade, por isso aparece só "convenção".
- [ ] **Foto do Sobre (027_0)**: confirmar que é ele e que pode usar. Também confirmar a legenda "As 53 folhas de 2025".
- [ ] **Loja**: confirmar preços e se ainda tem estoque:
  - Pintura A4: R$ 200
  - Pintura A5: R$ 60
  - Print A3: R$ 40
  - Ímã Flash Magnético: R$ 30, ou R$ 25 cada a partir de 3
- [ ] **Cupom CANHEDO** (Arromba / The One): confirmar se ainda vale.
- [ ] **Ficha "Me avisa quando vier pra cá"**: envia pro Google Forms dele (`formResponse`, no-cors). Não foi feito envio de teste; ele precisa mandar uma resposta e conferir se chegou na planilha.
- [ ] **Vídeo "quem sou eu"**: é o reel com legenda já gravada na imagem; confirmar que pode usar.
- [ ] **WhatsApp +55 61 99120-7679**: confirmar que é o número de agendamento.
- [ ] **Domínio**: definir; aí trocar `og:url`, `og:image`, os caminhos do `404.html`, tirar o `noindex` e liberar o `robots.txt`.

---
Site por L R G Z · lrgz.com.br
