"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/ArrowMark";

/*
 * Contact — written as a conversation rather than a form.
 *
 *   · hero: the headline, the direct lines (email copies in one click) and a
 *     reply promise, beside the enquiry card
 *   · the card is a letter being composed: pick what you need, watch the
 *     subject line follow, and fill the blanks of one plain sentence; the
 *     message box asks what is actually broken
 *   · sent: the letter folds away into a drawn check
 *   · after: what happens once you hit send, three plain steps on a line that
 *     draws itself in
 *
 * The four enquiry routes are kept distinct on purpose: a general question and
 * an RFP are handled by different people, and the route travels as the subject.
 *
 * Motion is GSAP, entrance-only plus one scroll reveal; the corner glows drift
 * on a CSS loop that rests off screen and holds still on budget devices.
 */

const ROUTES = [
  { key: "Talk to an Expert", verb: "talk to an expert", line: "General questions, answered by someone who builds it." },
  { key: "Book a Demo", verb: "book a demo", line: "See a platform running on data like yours." },
  { key: "Request a Consultation", verb: "explore a consultation", line: "Map where your digital transformation should start." },
  { key: "Request a Proposal", verb: "request a proposal", line: "Scope, timeline and cost, for serious opportunities and RFPs." },
];

const NEXT = [
  { t: "We read it", d: "A person, not an autoresponder, replies within one business day." },
  { t: "A short call", d: "Thirty minutes with someone who has implemented what you are asking about." },
  { t: "An honest recommendation", d: "Fit, scope and a clear next step, or a referral if we are not the right partner." },
];

const SALES_EMAIL = "sales@earrow.lk";
const PHONE = { v: "+94 11 234 5678", href: "tel:+94112345678" };

/* inline blank in the sentence: grows with what is typed */
const blank =
  "mx-1 inline-block min-w-[9ch] max-w-full border-0 border-b-2 border-border bg-transparent px-1 pb-0.5 font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/70 focus:border-orange";
const grow = { fieldSizing: "content" } as React.CSSProperties;
/* a blank that ends the sentence sits right against its full stop */
const blankEnd = blank.replace("mx-1", "ml-1").replace("px-1", "pl-1 pr-0");

export default function ContactContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [intent, setIntent] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const route = ROUTES[intent];

  /* entrance, and the steps line drawing in */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo("[data-c-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0.1)
        .fromTo("[data-c-in]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.45)
        .fromTo("[data-c-card]", { opacity: 0, y: 40, rotateX: 6 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, transformPerspective: 1200 }, 0.3);

      gsap.fromTo(
        "[data-c-rail]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: "[data-c-next]", start: "top 75%", once: true } },
      );
      gsap.fromTo(
        "[data-c-step]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.14, ease: "power3.out", scrollTrigger: { trigger: "[data-c-next]", start: "top 75%", once: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  /* the sent state: the check draws itself */
  useEffect(() => {
    if (status !== "sent" || prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-c-tick]", { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out", delay: 0.15 });
      gsap.fromTo("[data-c-done]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.25 });
    }, root);
    return () => ctx.revert();
  }, [status]);

  /*
   * The site is a static export with no server of its own, so submissions go
   * through FormSubmit (formsubmit.co), a form-to-email relay, straight to the
   * sales inbox. The very first submission makes FormSubmit send a one-time
   * activation email to that address; once it is confirmed, every enquiry is
   * delivered. If the relay is unreachable, the visitor gets a pre-filled mail
   * to the same address instead, so nothing typed is ever lost.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("_honey")) return; // a bot filled the hidden field
    const fields = {
      Enquiry: route.key,
      Name: String(data.get("name") ?? ""),
      Organisation: String(data.get("organisation") ?? ""),
      Email: String(data.get("email") ?? ""),
      Phone: String(data.get("phone") ?? ""),
      Message: String(data.get("message") ?? ""),
    };
    setStatus("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SALES_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...fields,
          _subject: `${route.key} — eArrow website enquiry`,
          _replyto: fields.Email,
          _template: "table",
          _captcha: "false",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === "false") throw new Error(json.message || "send failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SALES_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${SALES_EMAIL}`;
    }
  };

  const mailtoFallback = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`${route.key} — eArrow enquiry`)}`;

  return (
    <div ref={rootRef} className="ct-page">
      {/* ── Hero: the conversation starts here ── */}
      <section className="relative isolate overflow-hidden bg-canvas pb-16 pt-28 lg:pb-24 lg:pt-36">
        {/* light: two soft orange glows in opposite corners, a faint grid between */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="orb-drift absolute -left-[18%] -top-[30%] aspect-square w-[62vw] max-w-[820px] rounded-full"
            style={{ animationDuration: "26s", background: "radial-gradient(closest-side, rgba(255,120,50,0.42), rgba(255,170,110,0.18) 55%, transparent)" }}
          />
          <div
            className="orb-drift absolute -bottom-[35%] -right-[14%] aspect-square w-[58vw] max-w-[760px] rounded-full"
            style={{ animationDuration: "32s", animationDelay: "-11s", background: "radial-gradient(closest-side, rgba(232,59,0,0.32), rgba(255,177,59,0.14) 55%, transparent)" }}
          />
          <div className="tech-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000,transparent)]" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-12">
          {/* ── left: what to expect, and the direct lines ── */}
          <div className="lg:sticky lg:top-32">
            <p data-c-in className="ct-fade text-[13px] font-semibold text-orange">Contact</p>
            <h1 className="mt-4 font-heading text-[2.5rem] font-bold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.4rem] lg:text-[4rem]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-c-line className="block">Let&rsquo;s talk about</span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-c-line className="block">what you&rsquo;re</span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <span data-c-line className="block bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] bg-clip-text text-transparent">
                  trying to fix
                </span>
              </span>
            </h1>
            <p data-c-in className="ct-fade mt-6 max-w-md text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">
              Tell us how you operate today. We&rsquo;ll tell you honestly whether we&rsquo;re the right partner for it.
            </p>

            {/* direct lines */}
            <ul data-c-in className="ct-fade mt-10 max-w-md divide-y divide-border border-y border-border">
              <li className="flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-[12px] font-medium text-ink-soft">Email</span>
                  <a href={`mailto:${SALES_EMAIL}`} className="tap [--tap-y:9px] mt-0.5 block font-heading text-[17px] font-semibold tracking-[-0.01em] text-ink transition-colors hover:text-orange">
                    {SALES_EMAIL}
                  </a>
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="tap [--tap-y:6px] [--tap-x:4px] shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:border-orange/40 hover:text-orange"
                  aria-live="polite"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </li>
              <li className="flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-[12px] font-medium text-ink-soft">Phone</span>
                  <a href={PHONE.href} className="tap [--tap-y:9px] mt-0.5 block font-heading text-[17px] font-semibold tracking-[-0.01em] text-ink transition-colors hover:text-orange">
                    {PHONE.v}
                  </a>
                </span>
                <a href={PHONE.href} className="tap [--tap-y:6px] [--tap-x:4px] shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:border-orange/40 hover:text-orange">
                  Call
                </a>
              </li>
              <li className="py-4">
                <span className="block text-[12px] font-medium text-ink-soft">Office</span>
                <span className="mt-0.5 block font-heading text-[17px] font-semibold tracking-[-0.01em] text-ink">Nugegoda, Sri Lanka</span>
              </li>
            </ul>

            <p data-c-in className="ct-fade mt-6 inline-flex items-center gap-2.5 rounded-full bg-surface/80 px-4 py-2 text-[13px] font-medium text-ink-muted ring-1 ring-border">
              <span className="relative flex h-2 w-2">
                <span className="ct-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a]/50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16a34a]" />
              </span>
              We reply within one business day
            </p>
          </div>

          {/* ── right: the letter ── */}
          <div data-c-card className="ct-fade relative">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_40px_90px_-40px_rgba(120,40,0,0.45)]">
              {/* what you need: picking one sets the subject */}
              <div className="border-b border-border bg-surface-sunken/70 p-4 sm:p-5">
                <p className="px-1 text-[12px] font-medium text-ink-soft">What do you need?</p>
                <div role="radiogroup" aria-label="Enquiry type" className="mt-3 grid grid-cols-2 gap-2">
                  {ROUTES.map((r, i) => {
                    const on = i === intent;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setIntent(i)}
                        className={`rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-semibold leading-tight transition-[background-color,color,box-shadow] duration-300 sm:text-[14px] ${
                          on
                            ? "bg-gradient-to-br from-[#e83b00] to-[#ff8a2a] text-white shadow-[0_10px_24px_-12px_rgba(232,59,0,0.8)]"
                            : "bg-surface text-ink ring-1 ring-border hover:ring-orange/40"
                        }`}
                      >
                        {r.key}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 px-1 text-[13px] text-ink-muted">{route.line}</p>
              </div>

              {status === "sent" ? (
                /* ── sent ── */
                <div className="flex flex-col items-center px-7 py-16 text-center sm:px-10">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e83b00] to-[#ff9820] shadow-[0_14px_30px_-12px_rgba(232,59,0,0.8)]">
                    <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path data-c-tick d="M8 16.5l5.5 5.5L24 11" strokeDasharray="60" strokeDashoffset="0" />
                    </svg>
                  </span>
                  <h2 data-c-done className="mt-6 font-heading text-[1.6rem] font-bold tracking-[-0.03em] text-ink">Your message is on its way</h2>
                  <p data-c-done className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                    It went straight to {SALES_EMAIL}. Someone from the team will reply within one business day.
                  </p>
                  <button
                    data-c-done
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-7 rounded-full border border-border px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-orange/40 hover:text-orange"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                /* ── the letter ── */
                <form onSubmit={handleSubmit} className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
                  <div className="space-y-1 border-b border-dashed border-border pb-4 text-[13px]">
                    <p className="text-ink-soft">
                      To <span className="ml-2 font-medium text-ink">{SALES_EMAIL}</span>
                    </p>
                    <p className="text-ink-soft">
                      Subject <span className="ml-2 font-medium text-ink">{route.key} — website enquiry</span>
                    </p>
                  </div>

                  <p className="mt-6 text-[17px] leading-[2.3] text-ink-muted sm:text-[18.5px]">
                    Hi eArrow, I&rsquo;m
                    <input name="name" required aria-label="Your name" placeholder="your name" autoComplete="name" className={blank} style={grow} />
                    from
                    <input name="organisation" aria-label="Organisation" placeholder="your organisation" autoComplete="organization" className={blankEnd} style={grow} />.
                    I&rsquo;d like to <span className="font-semibold text-orange">{route.verb}</span>. You can reach me at
                    <input name="email" type="email" required aria-label="Email" placeholder="you@company.com" autoComplete="email" className={blank} style={grow} />
                    or
                    <input name="phone" type="tel" aria-label="Phone" placeholder="+94 …" autoComplete="tel" className={blankEnd} style={grow} />.
                  </p>

                  <label className="mt-6 block">
                    <span className="text-[14px] font-medium text-ink">Here&rsquo;s what we&rsquo;re trying to fix</span>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      className="mt-2 w-full resize-y rounded-2xl border border-border bg-surface-sunken px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-orange"
                      placeholder="The processes or systems causing the most friction today."
                    />
                  </label>

                  {/* honeypot: hidden from people, irresistible to bots */}
                  <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(232,59,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">{status === "sending" ? "Sending…" : "Send message"}</span>
                      <ArrowUpRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                    <p role="status" aria-live="polite" className="text-[13px] leading-relaxed text-ink-soft sm:text-right">
                      {status === "error" ? (
                        <>
                          We couldn&rsquo;t send that just now.{" "}
                          <a href={mailtoFallback} className="font-semibold text-orange underline underline-offset-4">
                            Email us instead
                          </a>
                        </>
                      ) : (
                        <>Goes straight to the team, no mailing lists</>
                      )}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── After you hit send ── */}
      <section data-c-next className="bg-canvas-alt py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="max-w-xl font-heading text-[2rem] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[2.6rem]">
            What happens after you hit send
          </h2>

          <div className="relative mt-12">
            {/* the line the steps hang from */}
            <span aria-hidden className="absolute left-0 right-0 top-[7px] hidden h-px bg-border md:block" />
            <span
              data-c-rail
              aria-hidden
              className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-gradient-to-r from-[#e83b00] via-[#ff7a1a] to-[#ffb13b] md:block"
            />
            <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {NEXT.map((s) => (
                <li key={s.t} data-c-step className="ct-fade group relative pl-7 md:pl-0 md:pt-10">
                  <span aria-hidden className="absolute left-0 top-[1px] h-[14px] w-[14px] rounded-full border-2 border-orange bg-canvas-alt md:top-0" />
                  <span aria-hidden className="absolute left-[6px] top-5 h-[calc(100%+1.5rem)] w-px bg-border group-last:hidden md:hidden" />
                  <h3 className="font-heading text-[1.25rem] font-bold tracking-[-0.02em] text-ink">{s.t}</h3>
                  <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-muted">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
