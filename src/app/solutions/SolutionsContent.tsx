"use client";

import { PageCta } from "@/components/page-kit";
import JourneyScene from "./JourneyScene";
import SolutionsHero from "./SolutionsHero";
import { type Group } from "./capabilities";
import CapabilityStage from "./CapabilityStage";

/*
 * Content transcribed from the revamp brief's "Solutions" sheet.
 *
 * The nine capability groups are data only; CapabilityStage owns how they are
 * presented, and its own notes cover why that treatment won.
 */

const GROUPS: Group[] = [
  {
    name: "HR & Workforce",
    code: "D01",
    art: "workforce",
    lead: "One employee record from hiring through payroll, attendance and appraisals.",
    items: [
      "HRIS",
      "Payroll",
      "Attendance",
      "Leave Management",
      "Performance Management",
      "Employee Self-Service",
      "Recruitment",
      "HR Analytics",
    ],
  },
  {
    name: "Education",
    code: "D02",
    art: "education",
    lead: "Admissions through graduation on a single academic platform.",
    items: [
      "Student Management",
      "Admissions",
      "Academic Management",
      "Attendance",
      "Fees",
      "Examination",
      "Parent/Student Portal",
      "Analytics",
    ],
  },
  {
    name: "Business Management",
    code: "D03",
    art: "workflow",
    lead: "Workflows, documents and reporting joined into one operating layer.",
    items: [
      "Workflow Automation",
      "Document Management",
      "Business Applications",
      "Reporting & Analytics",
      "Process Automation",
    ],
  },
  {
    name: "CRM",
    code: "D04",
    art: "funnel",
    lead: "Every lead, opportunity and customer conversation in one pipeline.",
    items: [
      "Lead Management",
      "Sales Pipeline",
      "Customer Management",
      "Opportunity Management",
      "Sales Activities",
      "Customer Analytics",
      "Reports & Dashboards",
    ],
  },
  {
    name: "Ticketing & Service",
    code: "D05",
    art: "queue",
    lead: "Requests tracked to resolution, against an SLA you can prove.",
    items: [
      "Ticket Management",
      "Help Desk",
      "SLA Management",
      "Escalation Management",
      "Customer Portal",
      "Knowledge Base",
      "Service Analytics",
    ],
  },
  {
    name: "AI & Intelligent Automation",
    code: "D06",
    art: "intelligence",
    lead: "Assistants and predictive analytics that take the repetitive work away.",
    items: [
      "AI Assistants",
      "Intelligent Workflows",
      "Predictive Analytics",
      "Automated Reporting",
      "AI-enabled Employee Services",
    ],
  },
  {
    name: "Managed IT Services",
    code: "D07",
    art: "shells",
    lead: "Infrastructure, cloud and security run as a service, monitored around the clock.",
    items: [
      "IT Infrastructure Management",
      "Cloud Management",
      "Server Management",
      "Network Management",
      "Cybersecurity",
      "Backup & Disaster Recovery",
      "Help Desk / IT Support",
      "System Monitoring",
      "Microsoft 365 Management",
      "Managed Applications",
    ],
  },
  {
    name: "Digital & Web Solutions",
    code: "D08",
    art: "window",
    lead: "Websites, portals and commerce platforms built for growth.",
    items: [
      "Corporate Websites",
      "E-commerce Websites",
      "Web Applications",
      "UI/UX Design",
      "Website Maintenance",
      "Domain & Hosting",
      "CMS Development",
      "API & System Integration",
    ],
  },
  {
    name: "Digital Marketing & Growth",
    code: "D09",
    art: "growth",
    lead: "Demand generation measured to the lead, not to the impression.",
    items: [
      "Social Media Marketing",
      "Social Media Management",
      "Content Creation",
      "Digital Advertising",
      "SEO",
      "Search Engine Marketing",
      "Brand Development",
      "Campaign Management",
      "Lead Generation",
      "Analytics & Reporting",
    ],
  },
];

/*
 * Both figures come off the same array the capability explorer reads, so the
 * masthead cannot end up quoting a number the section below it contradicts.
 * They are the only hard facts this page has above the fold — nine words of
 * lead copy was all a viewport-tall hero offered before.
 */
const CAPABILITY_COUNT = GROUPS.reduce((n, g) => n + g.items.length, 0);
const DOMAIN_COUNT = GROUPS.length;

/*
 * Which capability domains sit behind each stage of the journey, given as
 * indices into GROUPS rather than as repeated strings.
 *
 * The journey band names these domains so a reader can place their own
 * situation against one of the three stages. Reading them out of GROUPS means
 * the two sections can never disagree about what a domain is called — renaming
 * one in the array above renames it in both places, and an index that does not
 * exist is a build error rather than a label nobody notices is stale.
 */
const JOURNEY_COVERS = [
  [0, 1, 2], // Run       — the systems of record
  [5, 4, 6], // Optimise  — automation, service, managed IT
  [7, 8, 3], // Grow      — web, demand generation, CRM
].map((row) => row.map((i) => GROUPS[i].name));

export default function SolutionsContent() {
  return (
    <>
      <SolutionsHero capabilities={CAPABILITY_COUNT} domains={DOMAIN_COUNT} />

      <JourneyScene covers={JOURNEY_COVERS} />

      <CapabilityStage groups={GROUPS} />

      <PageCta
        title="Not sure which layer you need first?"
        body="Tell us how you operate today and we'll map the shortest path from where you are to where you want to be."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "See the Products", href: "/products" }}
      />
    </>
  );
}
