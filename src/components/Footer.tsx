import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./ArrowMark";
import { withBasePath } from "@/lib/basePath";
import { enabledLinks } from "@/lib/features";

const SITEMAP = [
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "Industries", href: "/industries" },
  { label: "Technology", href: "/technology" },
  { label: "About Us", href: "/about" },
];

/* The pages that don't earn a slot in the primary nav still need a route in. */
const COMPANY = [
  { label: "Customer Success", href: "/customer-success" },
  { label: "Insights", href: "/insights" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-canvas py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* phones: brand across the top; Explore down the left, Company then Contact down the right */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Image
              src={withBasePath("/earrow-logo-trim.webp")}
              alt="eArrow"
              width={1200}
              height={292}
              className="h-7 w-auto sm:h-8"
              style={{ filter: "var(--logo-filter)" }}
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted sm:mt-5">
              Intelligent business solutions and technology services.
              <br />
              Nugegoda, Sri Lanka
            </p>
          </div>

          <div className="row-span-2 sm:row-span-1">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Explore
            </p>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              {SITEMAP.map((l) => (
                <li key={l.label}>
                  <Link prefetch={false}
                    href={l.href}
                    className="text-sm text-ink transition-colors hover:text-orange"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Company
            </p>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              {enabledLinks(COMPANY).map((l) => (
                <li key={l.label}>
                  <Link prefetch={false}
                    href={l.href}
                    className="text-sm text-ink transition-colors hover:text-orange"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-ink-soft">
              Contact
            </p>
            <a
              href="mailto:sales@earrow.lk"
              className="group mt-3 inline-flex items-center gap-1.5 text-sm sm:mt-4 text-ink transition-colors hover:text-orange"
            >
              sales@earrow.lk
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="mt-2 text-sm text-ink">+94 11 234 5678</p>
            <p className="text-sm text-ink">+94 11 234 5679</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 sm:mt-14 sm:gap-4 sm:pt-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            &copy; {new Date().getFullYear()} eArrow. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Empowering People · Enabling Growth
          </p>
        </div>
      </div>
    </footer>
  );
}
