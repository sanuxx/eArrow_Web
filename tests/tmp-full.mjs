import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.waitForTimeout(4500);
const h = await p.evaluate(() => document.body.scrollHeight);
console.log("body height", h, "errors", errs);
let y = 0;
let i = 0;
while (y < h) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(500);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await p.screenshot({ path: `tests/__screens__/full-${String(i).padStart(2,"0")}.png` });
  console.log(i, "y=" + y, "overflowPx=" + overflow);
  y += 780;
  i++;
}
await ctx.close();
await b.close();
