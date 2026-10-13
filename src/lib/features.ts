/**
 * Site feature switches.
 *
 * Turning a feature off hides it from visitors without deleting any code:
 * its home-page section stops rendering, its links drop out of the nav and
 * footer, and its page returns the 404 page. Flip the value back to `true`
 * to bring it all back.
 */
export const FEATURES = {
  /** The Insights page (/insights) and the home page's Insights section. */
  insights: false,
} as const;

/** Drops links to disabled pages. */
export function enabledLinks<T extends { href: string }>(links: T[]): T[] {
  return links.filter((l) => FEATURES.insights || l.href !== "/insights");
}
