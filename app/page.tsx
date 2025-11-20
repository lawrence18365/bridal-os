import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Centralized bride timelines",
    description:
      "Keep every appointment, payment, and fitting organized in one elegant workspace built for bridal teams.",
    icon: CalendarCheck,
  },
  {
    title: "Automations that feel bespoke",
    description:
      "Send gentle reminders, collect measurements, and share status updates without losing the personal touch.",
    icon: Clock3,
  },
  {
    title: "Insightful, gentle analytics",
    description:
      "Spot bottlenecks, monitor inventory needs, and see payment health with calm, human-friendly dashboards.",
    icon: BarChart3,
  },
];

const steps = [
  {
    title: "Invite brides with a single link",
    copy: "Share a branded portal in seconds so every bride has their own space for dates, documents, and decisions.",
  },
  {
    title: "Guide fittings with clarity",
    copy: "Craft smooth appointment flows, capture notes, and keep the team aligned across stylists and tailors.",
  },
  {
    title: "Deliver on time with confidence",
    copy: "Automated nudges, transparent balances, and status tracking keep dresses moving toward the aisle.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF6F9] text-stone-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute right-10 top-10 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute left-1/2 bottom-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#FDF6F9]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-rose-50 shadow-lg shadow-rose-200/50">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                Bridal OS
              </p>
              <p className="font-serif text-lg">Gracefully organized weddings</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm font-medium text-stone-700 md:flex">
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 transition hover:bg-white hover:shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-rose-50 shadow-lg shadow-rose-200/60 transition hover:-translate-y-[1px] hover:bg-stone-800"
            >
              Book a demo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-rose-50 shadow-lg shadow-rose-200/60 transition hover:-translate-y-[1px] hover:bg-stone-800 md:hidden"
          >
            Book a demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto mt-6 flex max-w-6xl flex-col gap-14 rounded-3xl border border-white/60 bg-white/70 px-6 pb-20 pt-8 shadow-2xl shadow-rose-200/50 backdrop-blur md:mt-10 md:flex-row md:items-center md:gap-12 md:px-10 md:pb-28">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            Trusted by modern bridal boutiques
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl leading-[1.05] text-stone-900 sm:text-5xl md:text-6xl">
              Your bridal studio&apos;s
              <span className="block font-semibold text-stone-900">
                calm command center
              </span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-stone-700 md:text-xl">
              Bridal OS keeps every bride, fitting, invoice, and message flowing
              together. Give your team a serene workspace and your brides a
              luxurious, transparent experience.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-base font-semibold text-rose-50 shadow-lg shadow-rose-200/70 transition hover:-translate-y-[1px] hover:bg-stone-800"
            >
              Start free pilot
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white/80 px-6 py-3 text-base font-semibold text-stone-800 shadow-sm backdrop-blur transition hover:-translate-y-[1px] hover:border-stone-300"
            >
              View sample workspace
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:max-w-md">
            <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white/80 px-4 py-4 shadow-sm shadow-rose-200/40 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Sparkles className="h-4 w-4 text-rose-500" />
                Happier brides
              </div>
              <p className="font-serif text-3xl text-stone-900">98%</p>
              <p className="text-sm text-stone-600">Portal engagement rate</p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white/80 px-4 py-4 shadow-sm shadow-rose-200/40 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Clock3 className="h-4 w-4 text-amber-600" />
                Admin saved
              </div>
              <p className="font-serif text-3xl text-stone-900">6 hrs</p>
              <p className="text-sm text-stone-600">Per bride on average</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-rose-50 p-6 shadow-2xl shadow-rose-200/60 ring-1 ring-white/60">
            <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Live portal preview
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-rose-50">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Bride timeline
                    </p>
                    <p className="font-serif text-lg">Sienna Martinez</p>
                  </div>
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                  On track
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      next fitting
                    </p>
                    <p className="font-serif text-xl">April 12, 2:00 PM</p>
                  </div>
                  <div className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Stylist + Tailor
                  </div>
                </div>
                <div className="overflow-hidden rounded-full bg-stone-100">
                  <div className="h-2.5 w-[76%] rounded-full bg-stone-900" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-stone-700">
                  <div className="rounded-xl bg-amber-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700">
                      balance
                    </p>
                    <p className="font-semibold">$1,280</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-700">
                      status
                    </p>
                    <p className="font-semibold">Measurements locked</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-sky-700">
                      delivery
                    </p>
                    <p className="font-semibold">5 weeks</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-stone-900 px-4 py-3 text-rose-50 shadow-lg shadow-rose-200/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-200">
                    Gentle reminder
                  </p>
                  <p className="mt-1 font-serif text-lg">Send fittings prep</p>
                  <p className="mt-1 text-rose-100/80">
                    Templates that sound human and warm.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-stone-800 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Team handoff
                  </p>
                  <p className="mt-1 font-serif text-lg">Notes synced</p>
                  <p className="mt-1 text-stone-600">
                    Stylists, tailors, and sales stay aligned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-6xl space-y-10 px-6 pb-16 md:pb-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Built for modern ateliers
            </p>
            <h2 className="text-3xl leading-tight text-stone-900 md:text-4xl">
              A graceful system your team actually wants to use
            </h2>
          </div>
          <p className="max-w-xl text-stone-600">
            Bridal OS blends warmth with rigor. Every touchpoint feels curated,
              while operations hum quietly in the background.
            </p>
          </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-7 shadow-sm backdrop-blur transition hover:-translate-y-1.5 hover:border-rose-100 hover:shadow-xl hover:shadow-rose-200/60"
            >
              <div className="absolute -right-6 -top-12 h-28 w-28 rounded-full bg-rose-200/40 blur-2xl transition group-hover:scale-110" />
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50/70 px-3 py-2 text-stone-700 shadow-sm shadow-rose-200/60">
                <feature.icon className="h-5 w-5 text-stone-700" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Feature
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-stone-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl rounded-3xl border border-white/70 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 px-6 py-14 text-rose-50 shadow-2xl shadow-rose-200/60 md:px-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-200/80">
              Bride care workflow
            </p>
            <h2 className="text-3xl leading-tight md:text-4xl">
              Guide every bride with clarity from day one to &ldquo;I do&rdquo;
            </h2>
            <p className="text-rose-100/90">
              Replace scattered spreadsheets, sticky notes, and endless follow
              ups. Bridal OS keeps each bride on a serene, transparent path.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100/10 px-4 py-2 text-sm font-semibold text-rose-100 ring-1 ring-rose-200/30">
              2x faster onboarding · 40% fewer last-minute calls
            </div>
          </div>
          <div className="space-y-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-[2px]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100/15 text-rose-50 ring-1 ring-white/10">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-rose-100/80">{step.copy}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 text-sm font-semibold text-rose-100">
              <Sparkles className="h-4 w-4 text-rose-300" />
              Concierge onboarding included for every team.
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-10 rounded-3xl border border-white/80 bg-white/90 px-6 py-10 shadow-2xl shadow-rose-200/60 backdrop-blur md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-12">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Proof it works
            </p>
            <h2 className="text-3xl leading-tight text-stone-900 md:text-4xl">
              &ldquo;Our brides feel guided and our team breathes easier.&rdquo;
            </h2>
            <p className="text-lg text-stone-700">
              Boutique owners use Bridal OS to coordinate stylists, tailors, and
              finance without losing the artistry. The result: smoother fittings
              and brides who feel pampered every step of the way.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-200/60" />
              <div>
                <p className="font-semibold text-stone-900">
                  Amaya Chen, Founder
                </p>
                <p className="text-stone-600">Maison Aria Bridal</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-rose-50 shadow-lg shadow-rose-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200/80">
                  Boutique impact
                </p>
                <p className="font-serif text-2xl">Month 1 with Bridal OS</p>
              </div>
              <div className="rounded-full bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/30">
                Verified
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-rose-100/80">No-shows reduced</span>
                <span className="text-lg font-semibold text-rose-50">-32%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-rose-100/80">Invoices paid on time</span>
                <span className="text-lg font-semibold text-rose-50">+41%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-rose-100/80">Team context switching</span>
                <span className="text-lg font-semibold text-rose-50">-48%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-rose-200/90">
              <ShieldCheck className="h-4 w-4 text-rose-300" />
              SOC2-ready infrastructure with secure bride portals.
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:pb-28">
        <div className="rounded-3xl bg-stone-900 px-6 py-12 text-rose-50 shadow-2xl shadow-rose-200/70 md:px-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">
                Ready for day one
              </p>
              <h2 className="text-3xl leading-tight md:text-4xl">
                Elevate every bride experience with Bridal OS
              </h2>
              <p className="max-w-2xl text-rose-100/90">
                We onboard your team, tailor templates to your voice, and import
                your existing bride data so you can start delivering calm,
                confident service immediately.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-stone-900 shadow-lg shadow-rose-200/60 transition hover:-translate-y-[1px]"
              >
                Book a demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-rose-50 transition hover:-translate-y-[1px] hover:bg-white/10"
              >
                Explore the product
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
