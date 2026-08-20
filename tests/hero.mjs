/**
 * Hero act verification.
 *
 * `playwright` is the library, not `@playwright/test`, so this is a plain Node
 * script rather than a spec file. Run it with the dev server already up:
 *
 *   node tests/hero.mjs
 *
 * The determinism problem this works around: you cannot wheel the page and then
 * read transforms. Lenis lerps toward its target over ~15 frames and the scrub
 * is chasing that, so every assertion would be racy. Instead we jump the scroll
 * position directly and force a ScrollTrigger update, then wait two frames.
 */

import { chromium } from "playwright";
import assert from "node:assert";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
// `fileURLToPath`, not `url.pathname`: the repo path contains spaces, and
// `pathname` keeps them percent-encoded, so screenshots land in a stray
// "eArrow%20AI%20Transformation" directory instead of this one.
const SHOTS = fileURLToPath(new URL("./__screens__/", import.meta.url));

let failures = 0;
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    results.push(`  FAIL  ${name}\n          ${err.message.split("\n")[0]}`);
  }
}

/** Jump to a fraction of the hero track's scroll range, deterministically. */
async function seek(page, p) {
  await page.evaluate((progress) => {
    const track = document.querySelector(".hero-track");
    const start = track.offsetTop;
    const range = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, Math.round(start + range * progress));
    // Lenis would otherwise animate toward its own target and drag us back.
    window.__lenis?.scrollTo(Math.round(start + range * progress), {
      immediate: true,
      force: true,
    });
  }, p);
  // Three frames, not one: the scrub renders on the next frame, and anything
  // downstream of a MutationObserver (Nav's blur suppression) needs a React
  // render after that.
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(r))
        )
      )
  );
}

const styleOf = (page, sel, prop) =>
  page.evaluate(
    ([s, p]) => {
      const el = document.querySelector(s);
      return el ? getComputedStyle(el)[p] : null;
    },
    [sel, prop]
  );

/*
 * Next's dev-overlay badge is `position: fixed` bottom-left, so it lands inside
 * any region capture and it appears/animates asynchronously — which makes a
 * pixel-comparison flap for reasons that have nothing to do with the page.
 * Masked out of every screenshot.
 */
const devOverlay = (page) => [page.locator("nextjs-portal")];

const browser = await chromium.launch();

/* ── Desktop ─────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(BASE, { waitUntil: "networkidle" });

  // The scrub timeline is held at progress 0 until the intro resolves, so every
  // scroll assertion below would read the settled frame if we started early.
  await page
    .waitForFunction(
      () => {
        const s = document.querySelector(".hero-track")?.dataset.intro;
        return s === "done" || s === "skipped";
      },
      null,
      { timeout: 12000 }
    )
    .catch(() => {});

  await check("no page errors on load", () => {
    assert.deepStrictEqual(errors, [], errors.join(" | "));
  });

  await check("documentElement is the scroller (overflow-x: clip held)", async () => {
    const ok = await page.evaluate(
      () => document.scrollingElement === document.documentElement
    );
    assert.ok(ok, "body became the scroll container");
  });

  await check("native scroll position is truthful", async () => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(50);
    const y = await page.evaluate(() => window.scrollY);
    assert.ok(Math.abs(y - 500) < 60, `scrollY was ${y}, expected ~500`);
  });

  await check("hero stage is sticky", async () => {
    const pos = await styleOf(page, ".hero-stage", "position");
    assert.strictEqual(pos, "sticky");
  });

  await check("stage stays pinned to the viewport across the scrub", async () => {
    for (const p of [0.1, 0.35, 0.6, 0.9]) {
      await seek(page, p);
      const top = await page.evaluate(
        () => document.querySelector(".hero-stage").getBoundingClientRect().top
      );
      assert.ok(Math.abs(top) <= 2, `at ${p}, stage top was ${top}px, expected ~0`);
    }
  });

  await check("track creates ~280vh of height", async () => {
    const { h, vh } = await page.evaluate(() => ({
      h: document.querySelector(".hero-track").offsetHeight,
      vh: window.innerHeight,
    }));
    const ratio = h / vh;
    assert.ok(ratio > 2.6 && ratio < 3.0, `track was ${ratio.toFixed(2)}x viewport`);
  });

  await check("no horizontal overflow at any progress", async () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      await seek(page, p);
      const { w, cw } = await page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      assert.ok(w <= cw + 1, `at ${p}: scrollWidth ${w} > clientWidth ${cw}`);
    }
  });

  await check("data-phase tracks scroll progress", async () => {
    const expected = [
      [0.05, "depth"],
      [0.3, "separate"],
      [0.6, "iris"],
      [0.9, "land"],
    ];
    for (const [p, want] of expected) {
      await seek(page, p);
      const got = await page.evaluate(
        () => document.querySelector(".hero-stage").dataset.phase
      );
      assert.strictEqual(got, want, `at ${p}: phase was ${got}, expected ${want}`);
    }
  });

  await check("aperture is closed at rest, opens off-centre, lands fully open", async () => {
    // Every inset length, in source order [top, right, bottom, left]. The browser
    // collapses an all-zero inset to the shorthand `inset(0%)`, so compare parsed
    // numbers rather than pattern-matching the string.
    const insets = (s) => (s.match(/-?[\d.]+(?=%|px)/g) ?? []).map(Number);

    await seek(page, 0);
    const rest = insets(await styleOf(page, ".hero-iris", "clipPath"));
    await seek(page, 0.46);
    const born = insets(await styleOf(page, ".hero-iris", "clipPath"));
    await seek(page, 0.62);
    const mid = insets(await styleOf(page, ".hero-iris", "clipPath"));
    await seek(page, 1);
    const open = insets(await styleOf(page, ".hero-iris", "clipPath"));

    // At rest opposing edges must sum to >= 100%, which clips to zero area — a
    // closed aperture, not a small visible window sitting on the composition.
    assert.ok(
      rest[0] + rest[2] >= 99.5 && rest[1] + rest[3] >= 99.5,
      `expected zero area at rest, got inset(${rest.join(" ")})`
    );
    // Once born it is a real box: inset on all four sides, non-zero area.
    assert.ok(
      born.length >= 4 &&
        born.slice(0, 4).every((n) => n > 3) &&
        born[0] + born[2] < 99 &&
        born[1] + born[3] < 99,
      `expected a sub-frame box at 0.46, got inset(${born.join(" ")})`
    );
    // Opening off-centre: the right edge leads, so it closes on zero first.
    assert.ok(
      mid[1] < born[1] && mid[3] > mid[1],
      `expected an off-centre partial opening at 0.62, got inset(${mid.join(" ")})`
    );
    assert.ok(
      open.every((n) => n === 0),
      `expected a fully open iris at 1.0, got inset(${open.join(" ")})`
    );
  });

  await check("hero plate is spent by the end of the scrub", async () => {
    await seek(page, 1);
    const o = Number(await styleOf(page, ".hero-plate", "opacity"));
    assert.ok(o <= 0.6, `plate opacity was ${o} at progress 1`);
  });

  await check("counters run off scroll and reset when scrolled back", async () => {
    await seek(page, 1);
    const done = await page.evaluate(
      () => document.querySelector("[data-count-to='150']").textContent
    );
    await seek(page, 0.5);
    const early = await page.evaluate(
      () => document.querySelector("[data-count-to='150']").textContent
    );
    assert.strictEqual(done, "150", `expected 150 at the end, got ${done}`);
    assert.ok(Number(early) < 150, `expected an un-counted value at 0.5, got ${early}`);
  });

  await check("nav backdrop-blur is suppressed during the scrub", async () => {
    await seek(page, 0.5);
    // The header carries `transition-all duration-500`, so this asserts the
    // settled state, not a frame sampled mid-transition.
    await page.waitForTimeout(700);
    const f = await styleOf(page, "header", "backdropFilter");
    // Measure the radius rather than matching "none": a sample can still land
    // mid-flight and read something like `blur(2e-7px)` — numerically zero,
    // textually not.
    const blur = Number(f?.match(/blur\(([\d.e-]+)px\)/)?.[1] ?? 0);
    assert.ok(
      f === "none" || f === "" || blur < 1,
      `backdrop-filter was "${f}" during scrub`
    );
  });

  await check("nav progress bar still advances (framer-motion useScroll alive)", async () => {
    const read = async () => {
      const t = await styleOf(page, "header > div:last-of-type", "transform");
      const m = t?.match(/matrix\(([-\d.]+)/);
      return m ? Number(m[1]) : 0;
    };
    await seek(page, 0.1);
    const a = await read();
    await seek(page, 0.95);
    await page.waitForTimeout(400); // it is spring-smoothed
    const b = await read();
    assert.ok(b > a, `progress bar did not advance (${a} -> ${b})`);
  });

  mkdirSync(SHOTS, { recursive: true });
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await seek(page, p);
    await page.screenshot({ path: `${SHOTS}desktop-${p}.png`, mask: devOverlay(page) });
  }

  await ctx.close();
}

/* ── Intro state machine ─────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  await check("intro plays on a fresh session and then settles", async () => {
    await page.waitForFunction(
      () => document.querySelector(".hero-track")?.dataset.intro !== undefined,
      null,
      { timeout: 8000 }
    );
    const playing = await page.evaluate(
      () => document.querySelector(".hero-track").dataset.intro
    );
    assert.strictEqual(playing, "playing", `intro state was "${playing}" on load`);
    await page.waitForFunction(
      () => document.querySelector(".hero-track").dataset.intro === "done",
      null,
      { timeout: 8000 }
    );
  });

  /*
   * This used to assert the opposite — that a `sessionStorage` flag suppressed
   * the intro after the first view in a tab. That flag is gone: the reveal is
   * now required to play on every load, so the test asserts the requirement
   * rather than the mechanism that used to implement it.
   */
  await check("intro plays again on reload (every load, not once per tab)", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.querySelector(".hero-track")?.dataset.intro !== undefined,
      null,
      { timeout: 8000 }
    );
    const state = await page.evaluate(
      () => document.querySelector(".hero-track").dataset.intro
    );
    assert.strictEqual(state, "playing", `intro state was "${state}" on reload`);
    // and it still resolves rather than hanging mid-reveal
    await page.waitForFunction(
      () => document.querySelector(".hero-track").dataset.intro === "done",
      null,
      { timeout: 8000 }
    );
  });

  await ctx.close();
}

/* ── Reduced motion ──────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  await check("act collapses to normal flow", async () => {
    const pos = await styleOf(page, ".hero-stage", "position");
    assert.strictEqual(pos, "static");
  });

  await check("page is much shorter without the 280vh track", async () => {
    const { h, vh } = await page.evaluate(() => ({
      h: document.querySelector(".hero-track").offsetHeight,
      vh: window.innerHeight,
    }));
    assert.ok(h < vh * 2.2, `track was still ${(h / vh).toFixed(2)}x viewport`);
  });

  await check("counters show their final values", async () => {
    const v = await page.evaluate(
      () => document.querySelector("[data-count-to='150']").textContent
    );
    assert.strictEqual(v, "150");
  });

  // Scoped to the hero act deliberately. The rest of the page animates via
  // framer-motion `whileInView`, which does not consult the OS preference
  // unless wrapped in a MotionConfig — a pre-existing, site-wide condition
  // outside this change's scope.
  await check("the hero act is still once it has settled", async () => {
    const hero = page.locator(".hero-track");

    /*
     * Wait for the reveal to finish before sampling.
     *
     * This check used to assert the hero never moved at all under reduced
     * motion, which was true when reduced motion meant no animation whatsoever.
     * It no longer is: there is a deliberate motion-light path now — a curtain
     * cross-fade and then a 1.2s opacity reveal, no travel, scale or blur — so
     * a baseline taken on a fixed timer lands mid-fade and two frames 1.2s
     * apart legitimately differ.
     *
     * What the check is actually for survives intact: once settled, nothing in
     * the hero may move on its own. That is the scroll-scrubbed, parallaxing,
     * auto-playing behaviour reduced motion exists to suppress, and it is still
     * fully asserted below.
     */
    await page
      .waitForFunction(
        () => {
          const s = document.querySelector(".hero-track")?.dataset.intro;
          return s === "done" || s === "skipped";
        },
        null,
        { timeout: 12000 }
      )
      .catch(() => {});

    // Let fonts, images and the dev overlay settle before the baseline frame.
    await page.waitForTimeout(600);
    const a = await hero.screenshot({ mask: devOverlay(page) });
    await page.waitForTimeout(1200);
    const b = await hero.screenshot({ mask: devOverlay(page) });
    assert.ok(a.equals(b), "the hero was still moving after the reveal had settled");
  });

  await page.screenshot({ path: `${SHOTS}reduced-motion.png`, mask: devOverlay(page) });
  await ctx.close();
}

/* ── Mobile ──────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // The intro plays on mobile too, and it hides the composition until it
  // resolves — screenshotting before that captures an empty frame.
  await page
    .waitForFunction(
      () => {
        const s = document.querySelector(".hero-track")?.dataset.intro;
        return s === "done" || s === "skipped";
      },
      null,
      { timeout: 12000 }
    )
    .catch(() => {});

  await check("the hero composition is visible after the intro", async () => {
    const vis = await page.evaluate(() => {
      const pick = (s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { o: Number(cs.opacity), r: el.getBoundingClientRect() };
      };
      return { h1: pick("[data-l='h1a']"), mark: pick("[data-l='panel-outer']") };
    });
    assert.ok(vis.h1 && vis.h1.o > 0.9 && vis.h1.r.width > 0, "headline not visible");
    assert.ok(vis.mark && vis.mark.o > 0.9, "product panel not visible");
  });

  await check("no pin on mobile", async () => {
    const pos = await styleOf(page, ".hero-stage", "position");
    assert.notStrictEqual(pos, "sticky");
  });

  await check("no horizontal overflow on mobile", async () => {
    const { w, cw } = await page.evaluate(() => ({
      w: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    assert.ok(w <= cw + 1, `scrollWidth ${w} > clientWidth ${cw}`);
  });

  await page.screenshot({ path: `${SHOTS}mobile-0.png`, mask: devOverlay(page) });
  await ctx.close();
}

await browser.close();

console.log("\nHero act verification\n");
console.log(results.join("\n"));
console.log(
  `\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}\n` +
    `Screenshots: ${SHOTS}\n`
);
process.exitCode = failures === 0 ? 0 : 1;
