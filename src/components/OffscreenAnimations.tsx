"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Marks sections that are out of view with `data-offscreen`, which pauses the
 * CSS animations inside them (see globals.css). The GSAP loops get the same
 * treatment in lib/gsap.ts; this covers the keyframe loops — marquees, ring
 * spins, glows — so nothing animates where nobody can see it.
 *
 * Re-run per route: each page mounts its own sections.
 */
export default function OffscreenAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: "150px 0px" },
    );
    // a frame later, so the new page's sections are in the DOM
    const id = requestAnimationFrame(() => {
      document.querySelectorAll("main section, footer").forEach((el) => io.observe(el));
    });
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
