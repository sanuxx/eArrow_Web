import Image from "next/image";
import { ArrowUpRight } from "./ArrowMark";
import { withBasePath } from "@/lib/basePath";

const SITEMAP = [
  { label: "Solutions", href: "#solutions" },
  { label: "Products", href: "#products" },
  { label: "Industries", href: "#industries" },
  { label: "About Us", href: "#why" },
  { label: "Insights", href: "#insights" },
];

const LEGAL = [
  "Privacy Policy",
  "ISMS Policy",
  "End User Licence Agreement",
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-canvas py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Image
              src={withBasePath("/earrow-logo-white.png")}
              alt="eArrow"
              width={220}
              height={91}
              className="h-9 w-auto"
              style={{ filter: "var(--logo-filter)" }}
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
              Intelligent business solutions and technology services.
              <br />
              Nugegoda, Sri Lanka
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {SITEMAP.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-ink transition-colors hover:text-orange"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Contact
            </p>
            <a
              href="mailto:sales@earrow.lk"
              className="group mt-4 inline-flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-orange"
            >
              sales@earrow.lk
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="mt-2 text-sm text-ink">+94 11 234 5678</p>
            <p className="text-sm text-ink">+94 11 234 5679</p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            &copy; {new Date().getFullYear()} eArrow. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Empowering People · Enabling Growth
          </p>
        </div>
      </div>
    </footer>
  );
}
