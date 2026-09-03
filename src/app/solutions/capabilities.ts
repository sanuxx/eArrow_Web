import type { SOLUTION_ART } from "@/components/solution-art";

/**
 * The shape of one capability domain.
 *
 * It lives in its own module rather than being exported from whichever
 * component happens to render it. Three treatments of this data existed at one
 * point — a tabbed explorer, a specification matrix and the stage that
 * survived — and every one of them imported the type from the first, which
 * meant deleting a component would have taken the type with it and the
 * remaining two would have had to be edited to compile. A type that outlives
 * its renderers belongs beside the data, not inside a view.
 *
 * `art` is keyed to SOLUTION_ART rather than typed as a string, so a domain
 * naming a drawing that does not exist is a build error rather than a blank
 * square on the page.
 */
export type Group = {
  name: string;
  code: string;
  art: keyof typeof SOLUTION_ART;
  lead: string;
  items: string[];
};
