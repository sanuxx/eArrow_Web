"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { ArrowGlyph } from "./ArrowMark";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { withBasePath } from "@/lib/basePath";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Solutions", href: "#solutions" },
  { label: "Products", href: "#products" },
  { label: "Industries", href: "#industries" },
  { label: "About Us", href: "#why" },
  { label: "Insights", href: "#insights" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroScrub, setHeroScrub] = useState(false);
  const lenis = useSmoothScroll();

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
    const read = () => setHeroScrub(root.dataset.heroScrub === "1");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-hero-scrub"] });
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

  // Brief: a clean solid bar at rest; on scroll it becomes slightly
  // translucent, blurred, with a thin bottom border. The logo stays the same
  // size throughout so it never loses prominence.
  const lifted = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        lifted
          ? heroScrub
            ? // Same lifted look, opaque instead of blurred, for the duration of
              // the hero scrub. Visually near-identical; vastly cheaper.
              "border-b border-border bg-canvas"
            : "border-b border-border bg-canvas/70 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-canvas"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <a href="#home" onClick={() => setMenuOpen(false)}>
          <Image
            src={withBasePath("/earrow-logo-white.png")}
            alt="eArrow"
            width={220}
            height={91}
            className="h-10 w-auto sm:h-12"
            style={{ filter: "var(--logo-filter)" }}
            priority
          />
        </a>

        <ul className="hidden items-center gap-9 xl:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="group relative rounded-sm text-[0.8125rem] font-medium tracking-[0.01em] text-ink-muted transition-colors duration-300 hover:text-ink focus-visible:text-ink"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-orange to-amber transition-all duration-400 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle />
          <a
            href="#contact"
            className="group relative hidden items-center gap-2 overflow-hidden rounded-full border border-border-strong bg-surface px-5 py-2.5 text-[0.8125rem] font-semibold text-ink transition-colors duration-300 hover:border-orange hover:text-orange sm:inline-flex"
          >
            <span className="relative">Let&rsquo;s Talk</span>
            <ArrowGlyph className="relative h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-orange hover:text-orange xl:hidden"
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
        <ul className="flex flex-col gap-1 border-t border-border bg-canvas px-6 py-4 xl:hidden">
          {LINKS.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-4 rounded-2xl px-2 py-3 text-base font-medium text-ink-muted transition-colors hover:bg-line hover:text-ink"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft">
                  0{i + 1}
                </span>
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="block rounded-full bg-gradient-to-r from-orange to-amber px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Let&rsquo;s Talk
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
