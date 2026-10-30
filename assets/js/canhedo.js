(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ZAP = '5561991207679';
  const zapLink = msg => `https://wa.me/${ZAP}?text=${encodeURIComponent(msg)}`;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toque = matchMedia('(hover: none), (pointer: coarse)').matches;

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* hero: entra depois das fontes; no toque a folha é o vídeo gravado do mesmo shader */
  const hero = $('.hero');
  const entrar = () => requestAnimationFrame(() => hero && hero.classList.add('entrou'));
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(entrar);
  const cv = $('.folha-cv'), vid = $('.folha-video');
  function usarVideo() {
    if (!vid) return;
    if (cv) cv.remove();
    vid.hidden = false; vid.preload = 'auto';
    const tocar = () => { const p = vid.play(); if (p) p.catch(() => {}); };
    tocar();
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => e.isIntersecting ? tocar() : vid.pause()).observe(vid);
  }
  const forcar = new URLSearchParams(location.search).get('folha');
  if (forcar === 'video' || (forcar !== 'shader' && (toque || innerWidth < 900))) usarVideo();
  else if (cv) cv.addEventListener('folha-falhou', usarVideo);

  /* topo: sólido depois do hero, some ao descer e volta ao subir; WhatsApp flutuante */
  const topo = $('#topo'), zap = $('.zap'), gaveta = $('#gaveta'), menuBtn = $('.menu-btn');
  let yAnt = scrollY;
  function rolar() {
    const y = scrollY, limite = hero ? hero.offsetHeight * .6 : 80;
    const aberta = gaveta && !gaveta.hidden;
    topo.classList.toggle('solido', y > 20);
    topo.classList.toggle('escondido', !aberta && y > limite && y > yAnt + 4);
    if (y < yAnt - 4 || y < limite) topo.classList.remove('escondido');
    if (zap) zap.classList.toggle('vis', y > limite);
    yAnt = y;
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();

  /* gaveta do celular */
  function gavetaAbrir(abrir) {
    menuBtn.setAttribute('aria-expanded', abrir);
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) { gaveta.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => gaveta.classList.add('aberta'))); document.body.style.overflow = 'hidden'; topo.classList.add('solido'); }
    else { gaveta.classList.remove('aberta'); document.body.style.overflow = ''; setTimeout(() => { if (!gaveta.classList.contains('aberta')) gaveta.hidden = true; }, 400); }
  }
  menuBtn.addEventListener('click', () => gavetaAbrir(gaveta.hidden));
  gaveta.addEventListener('click', e => { if (e.target.closest('a')) gavetaAbrir(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !gaveta.hidden) gavetaAbrir(false); });

  /* revelação */
  const io = 'IntersectionObserver' in window && !reduz
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' })
    : null;
  const observar = el => io ? io.observe(el) : el.classList.add('vis');
  $$('.revela').forEach(observar);

  /* contador do 53 */
  const conta = $('[data-conta]');
  if (conta && io && !reduz) {
    const fim = +conta.dataset.conta; conta.textContent = '0';
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const passo = t => { const k = Math.min((t - t0) / 1400, 1); conta.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }, { threshold: .6 }).observe(conta);
  }

  /* vídeo "quem sou eu": toca mudo quando aparece; botão liga o som */
  $$('.tela-video').forEach(t => {
    const v = $('video', t), b = $('.som', t);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
    }, { threshold: .35 }).observe(v);
    b.addEventListener('click', () => {
      const ligar = v.muted; v.muted = !ligar; b.setAttribute('aria-pressed', ligar);
      if (ligar) { v.currentTime = 0; v.loop = false; } else v.loop = true;
      const p = v.play(); if (p) p.catch(() => {});
    });
    v.addEventListener('ended', () => { v.muted = true; v.loop = true; b.setAttribute('aria-pressed', 'false'); v.play().catch(() => {}); });
  });

  /* caixa de luz (fotos e flashes) */
  const cl = $('#caixa-luz'), clImg = $('.cl-fig img', cl), clLeg = $('.cl-fig figcaption', cl), clQuero = $('.cl-quero', cl);
  let lista = [], pos = 0, ultimoFoco = null;
  function mostrar(i) {
    pos = (i + lista.length) % lista.length;
    const it = lista[pos];
    clImg.style.opacity = 0;
    const im = new Image();
    im.onload = () => { clImg.src = it.src; clImg.alt = it.alt || ''; clImg.style.opacity = 1; };
    im.src = it.src;
    clLeg.textContent = it.leg || '';
    if (it.cod) { clQuero.hidden = false; clQuero.href = zapLink(`Oi Rodrigo! Vi no seu site o flash ${it.cod} e quero tatuar.`); }
    else clQuero.hidden = true;
    const varios = lista.length > 1; $('.cl-ant', cl).hidden = !varios; $('.cl-prox', cl).hidden = !varios;
  }
  function abrirLuz(itens, i) {
    lista = itens; ultimoFoco = document.activeElement;
    cl.hidden = false; document.body.style.overflow = 'hidden';
    mostrar(i);
    requestAnimationFrame(() => requestAnimationFrame(() => cl.classList.add('aberta')));
    $('.cl-fechar', cl).focus();
  }
  function fecharLuz() {
    cl.classList.remove('aberta'); document.body.style.overflow = '';
    setTimeout(() => { cl.hidden = true; clImg.removeAttribute('src'); }, 350);
    if (ultimoFoco) ultimoFoco.focus();
  }
  $('.cl-fechar', cl).addEventListener('click', fecharLuz);
  $('.cl-ant', cl).addEventListener('click', () => mostrar(pos - 1));
  $('.cl-prox', cl).addEventListener('click', () => mostrar(pos + 1));
  cl.addEventListener('click', e => { if (e.target === cl || e.target.classList.contains('cl-fig')) fecharLuz(); });
  addEventListener('keydown', e => {
    if (cl.hidden) return;
    if (e.key === 'Escape') fecharLuz(); else if (e.key === 'ArrowLeft') mostrar(pos - 1); else if (e.key === 'ArrowRight') mostrar(pos + 1);
  });
  let x0 = null;
  cl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  cl.addEventListener('touchend', e => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50 && lista.length > 1) mostrar(pos + (dx < 0 ? 1 : -1));
  });
  // fotos soltas: agrupadas pela seção
  document.addEventListener('click', e => {
    const img = e.target.closest('img[data-zoom]'); if (!img) return;
    const grupo = $$('img[data-zoom]', img.closest('section') || document);
    const itens = grupo.map(g => ({ src: g.dataset.grande || g.currentSrc || g.src, alt: g.alt, leg: (g.closest('figure') && $('figcaption', g.closest('figure'))) ? $('figcaption', g.closest('figure')).textContent : '' }));
    abrirLuz(itens, grupo.indexOf(img));
  });

  /* catálogo */
  const mural = $('#mural'), mais = $('#mais');
  const NOTAS = {
    maos: 'Folhas pintadas em papel, com o par colorido e preto e cinza.',
    digital: 'Flashes pintados no digital. Também dá pra tatuar colorido ou preto e cinza.',
    flashinhos: 'Flashinhos: desenhos pequenos, bons pra preencher espacinhos.'
  };
  const PASSO = toque ? 12 : 16;
  let catalogo = [], pasta = 'maos', mostrados = 0;
  function cartao(f, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'flash'; b.style.setProperty('--i', i % PASSO);
    b.dataset.cod = f.c;
    b.setAttribute('aria-label', `Flash ${f.c}, ampliar`);
    b.innerHTML = `<img src="assets/catalogo/${f.c}-560.webp" alt="Flash tradicional ${f.c} pintado por Rodrigo Canhedo" loading="lazy" decoding="async"><span class="flash-cod">${f.c}</span>`;
    return b;
  }
  function render(reset) {
    const itens = catalogo.filter(f => f.p === pasta);
    if (reset) { mural.innerHTML = ''; mostrados = 0; mural.className = 'mural ' + pasta; }
    const frag = document.createDocumentFragment();
    const novos = itens.slice(mostrados, mostrados + PASSO).map((f, i) => cartao(f, i));
    novos.forEach(n => frag.appendChild(n));
    mural.appendChild(frag);
    novos.forEach(observar);
    mostrados += novos.length;
    mais.hidden = mostrados >= itens.length;
    if (!mais.hidden) $('span', mais).textContent = `Mostrar mais (${itens.length - mostrados})`;
  }
  $$('.abas button').forEach(b => b.addEventListener('click', () => {
    if (b.getAttribute('aria-selected') === 'true') return;
    $$('.abas button').forEach(x => x.setAttribute('aria-selected', x === b));
    pasta = b.dataset.pasta; $('[data-nota-pasta]').textContent = NOTAS[pasta];
    render(true);
  }));
  mais.addEventListener('click', () => render(false));
  mural.addEventListener('click', e => {
    const b = e.target.closest('.flash'); if (!b) return;
    const itens = catalogo.filter(f => f.p === pasta).map(f => ({ src: `assets/catalogo/${f.c}-1600.webp`, alt: `Flash ${f.c}`, leg: `Flash ${f.c} · ${pasta === 'maos' ? 'pintado à mão' : pasta === 'digital' ? 'pintado no digital' : 'flashinho'}`, cod: f.c }));
    abrirLuz(itens, itens.findIndex(x => x.cod === b.dataset.cod));
  });
  fetch('assets/catalogo.json?v=1').then(r => r.json()).then(d => { catalogo = d; render(true); }).catch(() => {
    mural.innerHTML = '<p class="abas-nota">Não foi possível carregar o catálogo agora. Veja no Pinterest.</p>';
  });

  /* do papel pra pele */
  $$('.par').forEach(p => p.addEventListener('click', () => p.setAttribute('aria-pressed', p.getAttribute('aria-pressed') !== 'true')));

  /* loja: pedido pelo WhatsApp */
  $$('[data-pedido]').forEach(a => { a.href = zapLink(`Oi Rodrigo! Vi no seu site e quero ${a.dataset.pedido}.`); a.target = '_blank'; a.rel = 'noopener'; });

  /* ficha de viagem: envia para o Google Forms dele */
  const ficha = $('#ficha-viagem');
  if (ficha) {
    const URL_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSew2ZSpNE-14gvoSYAf-fxrnK6kMjuj-VpEAi1RlQPc8-3_vQ/formResponse';
    const msg = $('.ficha-msg', ficha);
    const tel = ficha.querySelector('[type="tel"]');
    tel.addEventListener('input', () => {
      const d = tel.value.replace(/\D/g, '').slice(0, 11);
      tel.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
    });
    ficha.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      $$('input[required]', ficha).forEach(i => {
        const vazio = !i.value.trim() || (i.type === 'tel' && i.value.replace(/\D/g, '').length < 10);
        i.setAttribute('aria-invalid', vazio); if (vazio) ok = false;
      });
      if (!ok) { msg.className = 'ficha-msg erro'; msg.textContent = 'Preencha nome, cidade e um WhatsApp com DDD.'; return; }
      const bt = $('button', ficha); bt.disabled = true; msg.className = 'ficha-msg'; msg.textContent = 'Enviando…';
      try {
        await fetch(URL_FORM, { method: 'POST', mode: 'no-cors', body: new FormData(ficha) });
        ficha.reset(); msg.className = 'ficha-msg ok'; msg.textContent = 'Pronto! Você entrou na lista. Quando eu for pra sua cidade, te dou um salve.';
      } catch (err) {
        msg.className = 'ficha-msg erro'; msg.textContent = 'Não deu pra enviar agora. Tente de novo ou me chame no WhatsApp.';
      }
      bt.disabled = false;
    });
  }
})();
