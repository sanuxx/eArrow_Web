"use client";

/**
 * The handoff between the brand curtain and the hero.
 *
 * These are two components that never meet in the tree — BrandIntro is a fixed
 * overlay mounted in the layout, HeroAct is a section inside the page — yet
 * they have to behave as one continuous shot: the curtain's logo pushes
 * through, and the hero composition resolves out of the same light. If the hero
 * simply started on its own clock, the composition would assemble behind an
 * opaque black screen and be finished by the time the curtain lifted.
 *
 * A module-level emitter rather than a DOM CustomEvent because of the ordering:
 * the hero subscribes from a `useEffect`, and there is no guarantee it mounts
 * before the curtain fires. `onCurtainLift` therefore calls back immediately if
 * the lift has already happened, which an event listener cannot do.
 */

let lifted = false;
const waiting = new Set<() => void>();

/**
 * Whether a curtain is running this load — the single source of truth both
 * components branch on, so they can never disagree about who owns the reveal.
 *
 * Read from the flag layout.tsx records before first paint, for the same reason
 * the hero does: measuring live means any scroll during hydration counts as
 * "the visitor is already down the page".
 */
export function curtainActive(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window as Window & { __earrowIntroEligible?: boolean })
      .__earrowIntroEligible === true
  );
}

/** Called by the curtain the instant it starts to lift, not when it finishes —
    the hero has to be assembling *underneath* a curtain that is still on its
    way out, or the join reads as two animations played back to back. */
export function signalCurtainLift() {
  if (lifted) return;
  lifted = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

/** Subscribe to the lift. Fires immediately if it already happened. Returns an
    unsubscribe so a torn-down hero cannot be called into. */
export function onCurtainLift(fn: () => void): () => void {
  if (lifted) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => {
    waiting.delete(fn);
  };
}

/** StrictMode remounts and hot reloads would otherwise leave `lifted` stuck on
    from a previous pass, so the curtain resets it as it mounts.

    It does NOT clear `waiting`. Effect order across the two subtrees is not
    something to bet the reveal on: if the hero happened to subscribe first,
    clearing here would silently drop it and the hero would sit at its opening
    frame forever. A stale waiter, by contrast, costs nothing — it plays a
    timeline that has already been killed. */
export function resetCurtain() {
  lifted = false;
}
