import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Sparkles,
  Shield,
  Users,
  Zap,
  Heart,
  BarChart3,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 49,
    description: "Perfect for new boutiques getting organized",
    features: [
      "Up to 25 active brides",
      "Beautiful bride portals",
      "Email notifications & reminders",
      "Payment tracking",
      "Appointment scheduling",
      "Basic analytics dashboard",
      "Document storage (5GB)",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 99,
    description: "For growing boutiques ready to scale",
    features: [
      "Up to 100 active brides",
      "Everything in Starter, plus:",
      "Alterations tracking system",
      "Unlimited file uploads & storage",
      "Advanced analytics & benchmarks",
      "Custom portal branding (logo, colors)",
      "CSV import/export",
      "Priority email support",
      "Concierge onboarding call",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    description: "For established boutiques & multi-location shops",
    features: [
      "Unlimited active brides",
      "Everything in Professional, plus:",
      "Multi-location support",
      "Team roles & permissions",
      "Custom workflows",
      "Dedicated account manager",
      "Phone support",
      "Custom integrations",
      "SLA guarantee",
      "Data migration assistance",
    ],
    cta: "Book a Demo",
    popular: false,
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All plans come with a 14-day free trial. No credit card required to start. You can explore the full product, add brides, and test all features before deciding.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. Cancel anytime with one click from your account settings. No contracts, no cancellation fees. If you cancel, you'll have access until the end of your billing period.",
  },
  {
    question: "What counts as an 'active bride'?",
    answer:
      "An active bride is anyone who hasn't picked up their dress yet. Once marked as 'Completed', they no longer count toward your limit. This means you can serve unlimited brides over time.",
  },
  {
    question: "How does billing work?",
    answer:
      "We charge monthly or annually (save 20% with annual). You can upgrade, downgrade, or cancel at any time. If you go over your bride limit, we'll notify you and help you upgrade smoothly.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If you're not happy within the first 30 days, we'll give you a full refund, no questions asked. We want you to love Bridal OS or get your money back.",
  },
  {
    question: "Can I import my existing bride data?",
    answer:
      "Yes! Professional and Enterprise plans include CSV import. We also offer free data migration assistance for Enterprise customers. Our team will help you get set up smoothly.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-rose-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-rose-50 shadow-lg shadow-rose-200/50">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                Bridal OS
              </p>
              <p className="font-serif text-lg">Pricing</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 text-stone-700 transition hover:bg-white"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-rose-50 shadow-lg transition hover:-translate-y-[1px]"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm">
          <Shield className="h-4 w-4" />
          14-Day Free Trial · No Credit Card Required
        </div>
        <h1 className="mt-6 text-5xl font-bold text-stone-900 md:text-6xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-stone-600">
          Choose the plan that fits your boutique. Start free, scale as you
          grow. Cancel anytime.
        </p>

        {/* Annual/Monthly Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white p-1 shadow-lg shadow-rose-200/30">
          <button className="rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-rose-50 transition">
            Monthly
          </button>
          <button className="rounded-full px-6 py-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900">
            Annual
            <span className="ml-2 text-xs text-emerald-600">(Save 20%)</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-3xl border bg-white p-8 shadow-xl transition hover:-translate-y-2 ${
                plan.popular
                  ? "border-rose-200 shadow-rose-200/60 ring-2 ring-rose-200"
                  : "border-stone-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  <Crown className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-stone-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-stone-900">
                  ${plan.price}
                </span>
                <span className="text-stone-600">/month</span>
              </div>

              <Link
                href="/sign-up"
                className={`mb-8 block w-full rounded-full py-3 text-center text-base font-semibold shadow-lg transition hover:-translate-y-[1px] ${
                  plan.popular
                    ? "bg-stone-900 text-rose-50 hover:bg-stone-800"
                    : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.includes("Everything in") ? (
                      <Sparkles className="h-5 w-5 shrink-0 text-rose-500" />
                    ) : (
                      <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.includes("Everything in")
                          ? "font-semibold text-stone-900"
                          : "text-stone-700"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Breakdown */}
      <section className="border-t border-stone-200 bg-gradient-to-b from-white to-rose-50/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-stone-900">
              Everything you need to run your boutique
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              All plans include these core features
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Bride Portals",
                description: "Beautiful, branded portals for each bride",
              },
              {
                icon: Calendar,
                title: "Appointments",
                description: "Schedule fittings and send auto-reminders",
              },
              {
                icon: DollarSign,
                title: "Payments",
                description: "Track balances and payment schedules",
              },
              {
                icon: FileText,
                title: "Documents",
                description: "Store contracts, receipts, and sketches",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "See your metrics vs industry benchmarks",
              },
              {
                icon: Zap,
                title: "Automation",
                description: "Email reminders for appointments & payments",
              },
              {
                icon: Heart,
                title: "Measurements",
                description: "Digital sign-off and alteration tracking",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "SOC2-ready infrastructure",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-lg"
              >
                <div className="mb-3 inline-flex items-center justify-center rounded-full bg-rose-100 p-3">
                  <feature.icon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="mb-2 font-semibold text-stone-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-stone-900">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Everything you need to know about Bridal OS pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6"
              >
                <h3 className="mb-2 text-lg font-semibold text-stone-900">
                  {faq.question}
                </h3>
                <p className="text-stone-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-stone-200 bg-gradient-to-b from-rose-50 to-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-stone-900">
            Ready to elevate your bridal boutique?
          </h2>
          <p className="mt-4 text-xl text-stone-600">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-lg font-semibold text-rose-50 shadow-lg transition hover:-translate-y-[1px]"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-8 py-4 text-lg font-semibold text-stone-900 shadow-sm transition hover:-translate-y-[1px]"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-6 text-sm text-stone-500">
            Questions? Email us at{" "}
            <a
              href="mailto:hello@bridal-os.com"
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              hello@bridal-os.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
