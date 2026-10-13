"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { ArrowGlyph } from "./ArrowMark";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { withBasePath } from "@/lib/basePath";
import { enabledLinks } from "@/lib/features";

/*
 * Real routes rather than in-page anchors.
 *
 * The site began as a single scrolled composition, so every nav item was a
 * hash. The revamp brief defines these as distinct pages, and a hash link from
 * /about to "#solutions" would resolve against a document that has no such
 * section — so the anchors could not survive the split.
 */
const LINKS = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "Industries", href: "/industries" },
  { label: "Technology", href: "/technology" },
  /* Placed here to follow the brief's own sheet order (…Technology, Customer
     Success, Insights…). The page was already built and already reachable from
     the footer and the Industries CTA, but it was the one section of the brief
     with no route in the primary nav. */
  { label: "Customer Success", href: "/customer-success" },
  { label: "About Us", href: "/about" },
  { label: "Insights", href: "/insights" },
];

const VISIBLE_LINKS = enabledLinks(LINKS);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroScrub, setHeroScrub] = useState(false);
  const [darkHero, setDarkHero] = useState(false);
  const [heroCine, setHeroCine] = useState(false);
  const lenis = useSmoothScroll();
  const pathname = usePathname();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * Drop the backdrop blur while the hero is scrubbing.
   *
   * A full-width `backdrop-filter: blur(40px) saturate(1.5)` over a viewport of
   * content that is being transformed every frame is the most expensive
   * combination in the compositor — the blur region has to be re-read and
   * re-blurred on each one. The bar flips to its lifted state at `scrollY > 40`,
   * so without this it is blurred for the entire scrubbed sequence.
   *
   * Done in React rather than in CSS on purpose: the obvious
   * `[data-hero-scrub="1"] header { backdrop-filter: none !important }` compiles
   * away — Tailwind's CSS pipeline drops the declaration and leaves only the
   * neighbouring `background`, so the rule looks present in the source, ships
   * broken, and fails silently. HeroAct owns the attribute; this observes it.
   */
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      setHeroScrub(root.dataset.heroScrub === "1");
      /* Set by `PageHero` while a `tone="dark"` masthead is mounted — see the
         note there. Without it the links would stay ink on a black hero. */
      setDarkHero(root.dataset.heroTone === "dark");
      /* Set by CinematicHero while its dark stage fills the viewport: the bar
         stays transparent over it instead of lifting onto a white ground. */
      setHeroCine(root.dataset.heroCine === "1");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, {
      attributes: true,
      attributeFilter: ["data-hero-scrub", "data-hero-tone", "data-hero-cine"],
    });
    return () => mo.disconnect();
  }, []);

  /*
   * Locking the mobile menu's scroll takes both halves now.
   *
   * `document.body.style.overflow = "hidden"` alone stopped working the moment
   * Lenis was introduced: Lenis reads wheel and touch events off `window` and
   * writes the scroll position itself, so it happily keeps scrolling a body that
   * CSS says cannot. `lenis.stop()` is what actually holds it; the body rule
   * stays for the reduced-motion case, where Lenis is never instantiated and
   * native scrolling is in charge.
   */
  useEffect(() => {
    if (!menuOpen) return;
    // Captured once here rather than read again in the cleanup: the instance is
    // stable for the life of the provider, and whatever we stopped is what we
    // must start again — even if the provider has since torn down.
    const instance = lenis.current;
    document.body.style.overflow = "hidden";
    instance?.stop();
    return () => {
      document.body.style.overflow = "";
      instance?.start();
    };
  }, [menuOpen, lenis]);

  const lifted = (scrolled && !heroCine) || menuOpen;

  /*
   * Whether the bar is currently sitting on a dark surface, which is the only
   * thing that decides whether its contents are white or ink.
   *
   * Two cases put a dark surface there: the top of the home page, whose hero
   * is its own black composition, and any inner page whose `PageHero` declares
   * `tone="dark"` — that one announces itself through `data-hero-tone` rather
   * than being listed here, so the header stays correct without a route list
   * to keep in sync. Everywhere else the surface is the canvas.
   *
   * It deliberately goes false as soon as the page moves at all, rather than
   * tracking the hero down the scrub. The hero opens an aperture onto
   * `StatsPlane` partway through, and that plane is `bg-canvas` — so "the hero
   * is still on screen" and "the surface under the bar is dark" stop being the
   * same statement halfway through the sequence, and following the hero would
   * put white links on a white plane for the second half of it.
   *
   * The bar takes a solid ground the moment it lifts, so there is never a
   * moment where transparent-over-unknown has to be guessed at.
   */
  const onDark = !lifted && (pathname === "/" || darkHero);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        /*
         * The canvas token, not `bg-black/80`.
         *
         * Translucent black over a light page is what made the lifted bar read
         * as a grey slab — it was never a grey anyone chose, it was black at
         * 80% compositing against whatever happened to be underneath.
         * `bg-canvas` is white in light mode and near-black in dark, so the bar
         * belongs to the page in both. This is what the bar was before the hero
         * rework switched it to a hardcoded black.
         */
        lifted
          ? heroScrub
            ? // Same lifted look, opaque instead of blurred, for the duration
              // of the hero scrub. Visually near-identical; vastly cheaper —
              // see the note on the observer above.
              "border-b border-border bg-canvas"
            : "border-b border-border bg-canvas/80 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <Link prefetch={false} href="/" onClick={() => setMenuOpen(false)}>
          {/*
            One asset, two appearances. The logo is white artwork on
            transparency, so on the dark hero it is used as-is and on the
            canvas it goes through `--logo-filter` — `invert(1)` in light mode,
            `none` in dark. That variable is how every other logo placement on
            the site handles the same problem, so there is no second file and
            no theme fork here.

            The drop shadow goes with the dark state. On white it was a grey
            haze around black artwork.
          */}
          <Image
            src={withBasePath("/earrow-logo-white.png")}
            alt="eArrow"
            width={220}
            height={91}
            className={`h-9 w-auto transition-[filter] duration-500 sm:h-11 ${
              onDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""
            }`}
            style={onDark ? undefined : { filter: "var(--logo-filter)" }}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-5 lg:flex xl:gap-7">
          {VISIBLE_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.label}>
                <Link prefetch={false}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative rounded-sm text-[0.875rem] font-medium tracking-[0.01em] transition-colors duration-300 ${
                    onDark
                      ? `hover:text-white focus-visible:text-white ${
                          active ? "text-white" : "text-white/75"
                        }`
                      : `hover:text-ink focus-visible:text-ink ${
                          active ? "text-ink" : "text-ink-muted"
                        }`
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-gradient-to-r from-orange to-amber transition-all duration-400 group-hover:w-full ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle />
          <Link prefetch={false}
            href="/contact"
            /* White pill on the dark hero; ink pill on the canvas. `bg-white`
               everywhere meant the button vanished the moment the bar took a
               light ground. */
            className={`group relative hidden items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-[0.8125rem] font-semibold shadow-md transition-all duration-300 hover:scale-105 sm:inline-flex ${
              onDark
                ? "bg-white text-black hover:bg-neutral-100"
                : "bg-ink text-canvas hover:opacity-90"
            }`}
          >
            <span>Get Started</span>
            <ArrowGlyph className="relative h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-orange lg:hidden ${
              onDark ? "border-white/20 text-white" : "border-border-strong text-ink"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Scroll progress — a hairline that reads as instrumentation. */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-orange to-amber"
      />

      {menuOpen && (
        /* fills the screen below the bar, so the page never shows through */
        <ul className="flex h-[calc(100svh-73px)] flex-col gap-1 overflow-y-auto border-t border-border bg-canvas px-6 py-6 lg:hidden">
          {VISIBLE_LINKS.map((link) => (
            <li key={link.label}>
              <Link prefetch={false}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-2xl px-2 py-3 text-lg font-medium text-ink transition-colors hover:bg-line hover:text-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-auto pt-4">
            <Link prefetch={false}
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block rounded-full bg-gradient-to-r from-orange to-amber px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Let&rsquo;s Talk
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
