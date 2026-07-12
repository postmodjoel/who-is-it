// Capture every playable mode on phone viewports for a visual review pass.
// Usage: PORT=8901 node tools/static-server.mjs &   (or any static server on OUT_PORT)
//        node tools/mode-screenshots.mjs [outDir]
// Writes <outDir>/<viewport>/<nn>-<mode>-<state>.png for: fresh board, mid-round (5 crossed off).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.OUT_PORT || 8901;
const OUT = process.argv[2] || "mode-shots";
const VIEWPORTS = [
  { tag: "iphone-390", width: 390, height: 780 },
  { tag: "small-320", width: 320, height: 568 }
];

const b = await chromium.launch();
for (const vp of VIEWPORTS) {
  const dir = path.join(OUT, vp.tag);
  fs.mkdirSync(dir, { recursive: true });
  const page = await b.newPage({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, isMobile: true });
  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await page.locator(".ts-local").waitFor();
  await page.locator(".ts-local").click();
  await page.waitForTimeout(300);
  const slots = page.locator(".ts-name-slot");
  const n = await slots.count();
  for (let i = 0; i < n; i++) await slots.nth(i).fill(["Ana", "Bo"][i] || `P${i}`);
  await page.waitForFunction(() => typeof generatedCharacters !== "undefined" && generatedCharacters.length > 10, { timeout: 20000 });
  await page.getByText("BEGIN", { exact: true }).click();
  await page.waitForTimeout(3200);
  await page.evaluate(() => document.querySelectorAll(".round-reveal,.dimension-warp,.onboard-tips,.title-screen").forEach((e) => e.remove()));
  await page.evaluate(() => { const c = currentPlayer(); c.secretVisible = true; render(); });

  const ids = await page.evaluate(() => window.MysteryModes.all().map((e) => e.id));
  let i = 0;
  for (const id of ids) {
    i += 1;
    const nn = String(i).padStart(2, "0");
    await page.evaluate((modeId) => {
      window.MysteryModes.clearMysteryEffectUI();
      window.MysteryModes.applyMysteryEffect(modeId);
      window.render();
      window.scrollTo(0, 0);
    }, id);
    await page.waitForTimeout(450);
    await page.evaluate(() => document.querySelectorAll(".effect-blast, .mystery-announce")?.forEach?.((e) => e.remove()));
    await page.screenshot({ path: path.join(dir, `${nn}-${id}-fresh.png`), fullPage: true });
    // Mid-round: cross five off so elimination styling is in shot.
    await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#characterBoard [data-id]")].slice(0, 5);
      cards.forEach((c) => { try { toggleEliminated(c.dataset.id); } catch (e) {} });
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(dir, `${nn}-${id}-midround.png`), fullPage: true });
    await page.evaluate(() => {
      const p = currentPlayer();
      [...p.eliminated].forEach((id) => { try { toggleEliminated(id); } catch (e) {} });
    });
  }
  await page.close();
  console.log(`${vp.tag}: ${i} modes captured -> ${dir}`);
}
await b.close();
console.log("DONE");
