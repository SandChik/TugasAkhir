// Ringkas results.json Playwright: id, status, durasi, anotasi, galat pertama.
import fs from "node:fs";
const r = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const semua = [];
const jelajah = (s) => { (s.specs || []).forEach((sp) => semua.push(sp)); (s.suites || []).forEach(jelajah); };
r.suites.forEach(jelajah);
for (const sp of semua) {
  const t = sp.tests[0]; const h = t.results[t.results.length - 1];
  console.log(`\n## ${sp.title.slice(0, 90)}\n   status=${h.status} durasi=${h.duration}ms`);
  for (const a of (h.annotations && h.annotations.length ? h.annotations : t.annotations)) console.log(`   - ${a.type}: ${String(a.description).slice(0, 400)}`);
  for (const e of h.errors || []) console.log(`   ! ${String(e.message).split("\n").slice(0, 6).join(" / ").slice(0, 600)}`);
}
