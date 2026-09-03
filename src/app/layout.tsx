import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import BrandIntro from "@/components/BrandIntro";
import "./globals.css";

/**
 * The display voice — every headline, section title and product name.
 *
 * Archivo replaces Sora, which was doing the job accurately and without much
 * conviction: a wide, even geometric sans that stayed calm at exactly the
 * sizes this site wants to shout. Archivo is a grotesque built for editorial
 * headlines — narrower, with squarer bowls and flat terminals, so at the 800
 * weight and tight tracking these headlines already use it lands harder and
 * fits more words per line. Narrower type at the same size reads faster,
 * which is most of what makes a page feel energetic rather than composed.
 *
 * It also keeps the full weight range to 900. That was a live constraint, not
 * a nicety: the headings are set at `font-extrabold`, and several livelier
 * candidates — Space Grotesk among them — stop at 700, where 800 would have
 * been synthesised into a faux-bold smear on the largest type on the site.
 *
 * The CSS variable is named for its role rather than its face, so changing
 * the family again is this file only — `--font-heading` in globals.css points
 * here and never needs to know which grotesque is currently in the slot.
 */
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Technical voice: every eyebrow label, metric, index and data readout is set
 * in mono. It is the single strongest signal that this is an engineering
 * company rather than a generic corporate template, and it keeps numerals on
 * a fixed width so counters don't jitter.
 */
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "eArrow | Empowering People, Enabling Growth",
  description:
    "Intelligent business solutions and technology services designed to help organizations work smarter, grow faster, and create lasting impact.",
};

/**
 * Runs before first paint, so neither of these can flash.
 *
 * THEME. The revamped site is designed light-first, so light is the default
 * rather than following the OS preference — a visitor with dark-mode set
 * system-wide would otherwise never see the intended palette. Dark remains
 * available and sticky once the user picks it from the toggle.
 *
 * SCROLL RESTORATION. Turned off, and that is what makes the hero's reveal play
 * on every load. The browser's default is to restore the previous scroll
 * position on a reload, and the hero deliberately refuses to play when it does
 * not own the top of the document — the reveal is a camera move onto the top of
 * the page, and running it while the reader is parked 2,000px down would either
 * animate off-screen or yank them upward. So on any reload after scrolling, the
 * intro was skipped: the one case that happens constantly while reviewing the
 * site.
 *
 * Setting `manual` means the browser never restores, every load genuinely
 * starts at the top, and the reveal's own precondition is satisfied honestly
 * rather than by forcing a scroll. It must be set here, in a blocking script —
 * an effect runs after restoration has already happened.
 *
 * The trade is real and deliberate: reload no longer returns you to where you
 * were. Hash links are unaffected — those set their own position, and the hero
 * checks for a hash separately.
 */
const bootScript = `
(function () {
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  } catch (e) {}
  /*
   * Whether the hero's reveal is allowed to play, decided HERE — at the top of
   * the document, before paint — rather than later inside the component.
   *
   * The hero only plays when it owns the top of the document. But it makes that
   * check in a React effect, which does not run until hydration is done: on a
   * cold dev load that is a couple of seconds, and any flick of the wheel in the
   * meantime moves the page off zero and the reveal silently suppresses itself.
   * The visitor did nothing wrong and the animation simply never appears.
   *
   * Recording eligibility before the user can possibly have scrolled makes the
   * decision about where the page *opened*, not where it happens to be by the
   * time React catches up.
   */
  try {
    window.__earrowIntroEligible =
      (window.pageYOffset || document.documentElement.scrollTop || 0) === 0 &&
      !window.location.hash;
  } catch (e) {
    window.__earrowIntroEligible = true;
  }
  /*
   * Hold the hero composition from the very first paint.
   *
   * Without this the page shows the FINISHED hero for as long as hydration
   * takes — 1.7s on a production build, longer in dev — and only then snaps
   * back to the reveal's opening frame and animates. The first thing the
   * visitor sees is the result, which is exactly why the reveal reads as
   * missing: by the time it runs, they have already seen the ending.
   *
   * Holding it is faithful to the timeline rather than a hack: the intro's own
   * first beat is 0.42s of held frame with the composition not yet arrived, so
   * this simply extends beat 0 back to first paint.
   *
   * It is NOT conditional on reduced motion. It used to be, back when reduced
   * motion meant no reveal at all — but the hero now has a calm 1.2s cross-fade
   * for that case (see buildCalmIntro), and a reveal that is preceded by a
   * flash of its own ending is the exact bug this attribute exists to prevent.
   *
   * The failsafe matters more than the effect. If hydration never completes,
   * this attribute would hide the hero forever, so it is cleared on a timer no
   * matter what — a visitor whose JS failed sees the settled hero, late, rather
   * than an empty one.
   */
  try {
    if (window.__earrowIntroEligible) {
      document.documentElement.setAttribute("data-intro-pending", "");
      /*
       * The curtain's black, painted by CSS from the very first frame.
       *
       * BrandIntro cannot do this itself: it is a React component, so the
       * earliest it can exist is hydration — measured at ~1.5s on a cold dev
       * load. Until then the visitor sees a white page, and then it turns
       * black, which is precisely the "site loaded, then something else
       * happened" impression a brand reveal exists to avoid.
       *
       * So the ground is laid here and the component takes it over. The
       * attribute is dropped the moment BrandIntro's own opaque overlay is up,
       * which is invisible — black replacing identical black — and must happen
       * before the lift, or the curtain would fade out to reveal this layer
       * still sitting there.
       */
      document.documentElement.setAttribute("data-curtain-boot", "");
      setTimeout(function () {
        document.documentElement.removeAttribute("data-intro-pending");
        document.documentElement.removeAttribute("data-curtain-boot");
      }, 4000);
    }
  } catch (e) {}
  try {
    var stored = window.localStorage.getItem("earrow-theme");
    document.documentElement.setAttribute(
      "data-theme",
      stored === "dark" ? "dark" : "light"
    );
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="light"
      className={`${display.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
    >
      {/*
        `h-full` on <html> and `min-h-full` on <body> are gone. Lenis' own reset
        forces `html.lenis, html.lenis body { height: auto }` the moment it
        attaches, so `min-h-full` would resolve against an auto-height parent,
        compute to no minimum, and silently drop the sticky-footer guarantee.
        `min-h-dvh` is measured against the viewport instead and is immune.
      */}
      <body className="flex min-h-dvh flex-col bg-canvas text-ink">
        {/*
          A raw parser-blocking <script>, not `next/script`.
          `strategy="beforeInteractive"` was measured running ~830ms in — long
          after the hero had already painted — which defeats the entire point of
          a pre-paint script: the theme could flash and, worse, the hero's hold
          would be applied after the finished composition was already on screen.
          A plain tag as the first child of <body> executes while the parser is
          still ahead of the hero markup, which is the only guarantee that
          matters here.
        */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />

        {/*
          Skip link — the first thing in the tab order.

          The header carries seven nav items, a theme toggle and a CTA, and it
          is repeated on all ten pages, so without this a keyboard user pays
          ten stops before reaching the content on every single navigation.

          Off-screen rather than `display: none`, because a hidden element is
          not focusable and the link would never surface. `focus:` brings it
          back into the viewport, and it sits above the fixed header's z-50.
        */}
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-canvas focus:not-sr-only focus:fixed focus:left-6 focus:top-6"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          {/*
            The brand curtain — the logo on black, before the site.

            This reverses an earlier decision, deliberately and at the client's
            request, so the reasoning against it is worth keeping rather than
            deleting: an opaque interstitial is exactly what LCP punishes, and
            the reveal used to play inside the hero's own layout precisely so
            the <h1> was paint-eligible on the first frame.

            What makes it acceptable now is that the curtain is not a loading
            screen. It never waits on the network, it is gone in 2.5s, any input
            dismisses it, it does not run for a visitor who arrived deep-linked
            or mid-page, and it hands the reveal to the hero rather than
            duplicating it. It is still a cost; it is now a bounded and
            deliberate one.

            Inside SmoothScrollProvider because it stops Lenis for its duration
            — the hero's scroll-scrubbed sequence starts at the top of the
            document, and a wheel event behind the black would scrub a
            composition nobody can see.
          */}
          <BrandIntro />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
