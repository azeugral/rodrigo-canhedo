/* Folha de flash sendo pintada: esboço a lápis, traço preto, cor em aguada e troca de folha.
   Cada flash tem a arte (flash-N.webp) e um mapa (mapa-N.webp, gerado por tools/hero.py):
   R = ordem do traço, G = ordem da cor, B = papel. O canvas desenha a folha inteira (papel incluso).
   ?p=0.5 congela a fase para conferir; window.__folhaQuadro(seg) desenha um instante (gravação). */
(() => {
  const cv = document.querySelector('canvas.folha-cv');
  if (!cv) return;
  const BASE = cv.dataset.base || 'assets/hero/';
  const LISTA = (cv.dataset.flashes || '143,149,140,136').split(',');
  const CICLO = 11; // segundos por folha
  const q = new URLSearchParams(location.search);
  const fixo = q.has('p') ? parseFloat(q.get('p')) : null;
  const gravando = q.has('gravar');
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: gravando });
  if (!gl) { cv.dispatchEvent(new Event('folha-falhou')); return; }

  const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0,1);}`;
  const FS = `precision highp float;varying vec2 v;
uniform sampler2D uArte,uMapa;uniform float uP,uT;uniform vec3 uFundo;uniform vec2 uRes;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*ns(p);p*=2.03;a*=.5;}return s;}
void main(){
 vec2 uv=v;
 vec4 arte=texture2D(uArte,uv);vec3 m=texture2D(uMapa,uv).rgb;
 float grao=h(floor(uv*vec2(1024.,1280.)))-.5;
 float fibra=fbm(uv*vec2(60.,75.))-.5;
 vec3 papel=uFundo*(1.+grao*.07+fibra*.05);
 float luma=dot(arte.rgb,vec3(.299,.587,.114));
 float dFundo=length(arte.rgb-uFundo);
 float ehPapel=1.-smoothstep(.06,.14,dFundo);
 float sat=max(arte.r,max(arte.g,arte.b))-min(arte.r,min(arte.g,arte.b));
 float preto=(1.-smoothstep(.15,.25,luma))*(1.-smoothstep(.22,.34,sat));
 float n=fbm(uv*9.+3.1);
 // fases
 float pEsb=smoothstep(.02,.12,uP)*(1.-smoothstep(.40,.60,uP));
 float pLin=clamp((uP-.08)/.36,0.,1.);
 float pCor=clamp((uP-.42)/.38,0.,1.);
 float pSai=smoothstep(.93,1.,uP);
 vec3 c=papel;
 // esboço a lápis: o desenho em cinza claro, tremido
 float lapis=(1.-ehPapel)*(.25+.75*preto)*pEsb*(.55+.45*fbm(uv*40.));
 c=mix(c,papel*.72,lapis*.55);
 // cor em aguada: frente orgânica e borda mais escura enquanto molhada
 float tc=m.g+(n-.5)*.06;
 float rc=smoothstep(tc-.018,tc+.002,pCor)*(1.-ehPapel)*(1.-preto);
 float molhado=rc*(1.-smoothstep(0.,.05,pCor-tc));
 vec3 corA=arte.rgb*(1.-molhado*.16);
 c=mix(c,corA,rc);
 // traço preto: avança como a ponta do pincel
 float tl=m.r;
 float rl=smoothstep(tl-.012,tl,pLin+(n-.5)*.004)*preto;
 c=mix(c,arte.rgb,rl);
 // troca de folha: a arte se desfaz no papel
 float d=smoothstep(fbm(uv*5.+7.)-.08,fbm(uv*5.+7.)+.02,pSai*1.15);
 c=mix(c,papel,d);
 // vinheta leve da folha
 vec2 b=abs(uv-.5)*2.;c*=1.-.06*pow(max(b.x,b.y),5.);
 gl_FragColor=vec4(c,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.dispatchEvent(new Event('folha-falhou')); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uP = U('uP'), uT = U('uT'), uFundo = U('uFundo'), uRes = U('uRes');
  gl.uniform1i(U('uArte'), 0); gl.uniform1i(U('uMapa'), 1);

  const carregar = src => new Promise((ok, erro) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = erro; i.src = src; });
  function textura(img) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  // cor do papel de cada flash: média da borda da arte
  function fundoDe(img) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 80;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, 64, 80);
    const d = x.getImageData(0, 0, 64, 4).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; return [r / n / 255, g / n / 255, b / n / 255];
  }
  const folhas = [];
  async function folha(i) {
    if (folhas[i]) return folhas[i];
    const n = LISTA[i];
    const [a, m] = await Promise.all([carregar(BASE + 'flash-' + n + '.webp'), carregar(BASE + 'mapa-' + n + '.webp')]);
    return (folhas[i] = { arte: textura(a), mapa: textura(m), fundo: fundoDe(a) });
  }

  function tamanho() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    gl.viewport(0, 0, cv.width, cv.height);
  }
  const legenda = document.querySelector('[data-folha-legenda]');
  let atual = -1;
  function desenhar(seg) {
    const i = Math.floor(seg / CICLO) % LISTA.length;
    const f = folhas[i]; if (!f) return false;
    if (i !== atual) {
      atual = i;
      if (legenda && legenda.dataset['n' + i]) legenda.textContent = legenda.dataset['n' + i];
      folha((i + 1) % LISTA.length).catch(() => {});
    }
    const p = fixo !== null ? fixo : (seg % CICLO) / CICLO;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, f.arte);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, f.mapa);
    gl.uniform1f(uP, p); gl.uniform1f(uT, seg); gl.uniform3fv(uFundo, f.fundo); gl.uniform2f(uRes, cv.width, cv.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  let t0 = null, visivel = true, rodando = false, perdido = false;
  function laco(ts) {
    if (!visivel || perdido) { rodando = false; return; }
    if (t0 === null) t0 = ts;
    const seg = (ts - t0) / 1000 + (q.has('seg') ? +q.get('seg') : 0);
    desenhar(seg);
    requestAnimationFrame(laco);
  }
  function iniciar() { if (!rodando && !gravando) { rodando = true; requestAnimationFrame(laco); } }

  window.__folhaQuadro = async seg => {
    await folha(Math.floor(seg / CICLO) % LISTA.length); tamanho(); desenhar(seg); gl.finish(); return true;
  };
  window.__folhaCiclo = CICLO * LISTA.length;

  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); perdido = true; cv.dispatchEvent(new Event('folha-falhou')); });
  new ResizeObserver(() => { tamanho(); if (atual >= 0 && !rodando) desenhar(fixo !== null ? fixo * CICLO : 0); }).observe(cv);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) iniciar(); }).observe(cv);

  folha(0).then(() => {
    tamanho();
    cv.classList.add('pronto');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches && fixo === null) { desenhar(CICLO * .86); return; }
    if (fixo !== null) { desenhar(0); return; }
    iniciar();
  }).catch(() => cv.dispatchEvent(new Event('folha-falhou')));
})();
