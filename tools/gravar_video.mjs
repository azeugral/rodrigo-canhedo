// Grava o loop da folha para o celular (o shader do hero, quadro a quadro, no Edge headless).
// Uso (servidor local na 8862): node tools/gravar_video.mjs pasta-quadros [largura altura]
// Depois: ffmpeg -framerate 30 -i pasta/%04d.jpg -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart assets/hero/folha.mp4
import { spawn } from "node:child_process";
import fs from "node:fs";
const pasta = process.argv[2] || "quadros";
const W = +(process.argv[3] || 640), H = +(process.argv[4] || 800), FPS = 30;
fs.mkdirSync(pasta, { recursive: true });
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const port = 9400 + Math.floor(Math.random() * 400);
const perfil = fs.mkdtempSync((process.env.TEMP || ".") + "/edge-gravar-");
const p = spawn(edge, ["--headless=new", `--remote-debugging-port=${port}`, "--user-data-dir=" + perfil, "--hide-scrollbars", "--use-angle=d3d11", "about:blank"], { stdio: "ignore" });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50 && !ws; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); ws = (l.find(x => x.type === "page") || {}).webSocketDebuggerUrl; } catch {} await dormir(200); }
const s = new WebSocket(ws); await new Promise(r => s.onopen = r);
let id = 0; const pend = {};
s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
const cmd = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; s.send(JSON.stringify({ id: i, method, params })); });
await cmd("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await cmd("Page.enable");
await cmd("Page.navigate", { url: "http://localhost:8862/tools/video.html?gravar" });
await dormir(2500);
const ciclo = (await cmd("Runtime.evaluate", { expression: "window.__folhaCiclo", returnByValue: true })).result.result.value;
const total = Math.round(FPS * ciclo);
for (let f = 0; f < total; f++) {
  await cmd("Runtime.evaluate", { expression: `window.__folhaQuadro(${(f / FPS).toFixed(5)})`, awaitPromise: true });
  const shot = await cmd("Page.captureScreenshot", { format: "jpeg", quality: 95 });
  fs.writeFileSync(`${pasta}/${String(f).padStart(4, "0")}.jpg`, Buffer.from(shot.result.data, "base64"));
  if (f % 150 === 0) console.log(`quadro ${f}/${total}`);
}
s.close(); p.kill();
console.log("pronto", total);
process.exit(0);
