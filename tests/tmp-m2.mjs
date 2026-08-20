import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, label] of [[360, 740, "360"], [390, 844, "390"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await p.waitForTimeout(4500);
  await p.evaluate(() => document.querySelector("[data-t='glyph-wrap']")?.closest("section")?.scrollIntoView());
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `tests/__screens__/m2-${label}.png`, fullPage: false });
  // next slide with longest name-ish content
  await p.click("button[aria-label='Next testimonial']");
  await p.waitForTimeout(1700);
  await p.screenshot({ path: `tests/__screens__/m2-${label}-b.png` });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(label, "overflowPx:", overflow);
  await ctx.close();
}
await b.close();
