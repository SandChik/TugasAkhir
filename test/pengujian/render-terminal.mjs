// Render keluaran mentah `npx hardhat test` (ANSI dari pseudo-TTY) ke emulator terminal xterm.js,
// lalu simpan screenshot. Isi keluaran tidak diubah; hanya baris prompt yang ditambahkan.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [, , masuk, keluar, judul = "root@ledgerdik-uji: /app"] = process.argv;
const PROMPT = "\x1b[1;32mroot@ledgerdik-uji\x1b[0m:\x1b[1;34m/app\x1b[0m# ";
const data = PROMPT + "npx hardhat test\r\n" + fs.readFileSync(masuk, "utf8") + PROMPT;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=block">
<script src="https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.js"></script>
<style>
  html, body { margin: 0; background: #ffffff; }
  #jendela { display: inline-block; margin: 0; background: #1e1e1e; border: 1px solid #3c3c3c; border-radius: 6px; overflow: hidden; }
  #term { padding: 10px 12px 4px; }
  .xterm .xterm-viewport { overflow: hidden !important; }
</style></head>
<body><div id="jendela"><div id="term"></div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 2000 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.load("13px 'JetBrains Mono'"));
const hasil = await page.evaluate(async ({ data, judul }) => {
  const term = new Terminal({
    cols: 125, rows: 110, fontSize: 13, lineHeight: 1.0, cursorBlink: false, cursorStyle: "block",
    fontFamily: "'JetBrains Mono', 'FreeMono', 'Unifont', monospace",
    theme: {
      background: "#1e1e1e", foreground: "#d4d4d4", cursor: "#d4d4d4",
      black: "#000000", red: "#f14c4c", green: "#23d18b", yellow: "#f5f543", blue: "#3b8eea",
      magenta: "#d670d6", cyan: "#29b8db", white: "#e5e5e5", brightBlack: "#767676",
      brightGreen: "#23d18b", brightBlue: "#3b8eea",
    },
  });
  term.open(document.getElementById("term"));
  await new Promise((r) => term.write(data, r));
  const buf = term.buffer.active;
  const baris = [];
  for (let i = 0; i <= buf.baseY + buf.cursorY; i++) baris.push(buf.getLine(i)?.translateToString(true) ?? "");
  return { baseY: buf.baseY, cursorY: buf.cursorY, baris };
}, { data, judul });
if (hasil.baseY !== 0) throw new Error(`keluaran melebihi ${110} baris, naikkan rows`);
const rows = await page.locator(".xterm-rows > div").all();
const bawah = (await rows[hasil.cursorY].boundingBox()).y + (await rows[hasil.cursorY].boundingBox()).height;
const kotak = await page.locator("#jendela").boundingBox();
await page.screenshot({ path: keluar, clip: { x: kotak.x, y: kotak.y, width: kotak.width, height: bawah - kotak.y + 12 } });
fs.writeFileSync(keluar.replace(/\.png$/, ".layar.txt"), hasil.baris.join("\n") + "\n");
console.log(`baris layar: ${hasil.cursorY + 1}, ukuran css: ${Math.round(kotak.width)}x${Math.round(bawah - kotak.y + 12)}`);
await browser.close();
