import { Briefcase, CheckCircle2, Map, MessageSquare, Target } from "lucide-react";
import MarketingHeader from "./_components/MarketingHeader";
import MarketingFooter from "./_components/MarketingFooter";
import HeroCTA from "./_components/HeroCTA";
import FadeInSection from "./_components/FadeInSection";
import HeroShowcase from "./_components/HeroShowcase";
import RoadmapShowcase from "./_components/RoadmapShowcase";
import HowItWorksSection from "./_components/HowItWorksSection";
import { getTokenCookie } from "@/lib/cookies";

const institutions = [
  "KATHMANDU UNIVERSITY",
  "TRIBHUVAN UNIVERSITY",
  "PULCHOWK CAMPUS",
  "PURWANCHAL UNIVERSITY",
  "KATHFORD COLLEGE",
];

const features = [
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "See exactly which skills stand between you and your target role.",
  },
  {
    icon: Map,
    title: "AI Roadmap",
    description: "A milestone-by-milestone path with real resources — not generic advice.",
  },
  {
    icon: MessageSquare,
    title: "Mock Interview",
    description: "Practice with an AI interviewer and get scored like the real thing.",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    description: "Live job recommendations matched to your verified skills.",
  },
];

const stats = [
  {
    stat: "70%+",
    text: "of graduates say their degree alone didn't prepare them for the skills employers ask for.",
  },
  {
    stat: "7",
    text: "career paths mapped end-to-end today, from Backend Developer to Ethical Hacking.",
  },
  {
    stat: "100%",
    text: "personalized — built from your actual degree, resume, and practice history.",
  },
];

export default async function Home() {
  const token = await getTokenCookie();
  const isAuthenticated = !!token;

  return (
    <>
      <MarketingHeader isAuthenticated={isAuthenticated} />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative mx-auto max-w-[1400px] overflow-hidden px-6 pb-10 pt-20 sm:px-8 md:pt-28 lg:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(198,234,93,0.16),transparent_65%)]"
          />
          <FadeInSection className="mx-auto max-w-2xl space-y-7 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white py-1.5 pl-1.5 pr-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                D
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Dakshya · Career Navigator
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] text-neutral-900 sm:text-5xl">
              Your career isn&apos;t a guess. <span className="text-primary">It&apos;s a plan.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-neutral-500">
              Dakshya turns the gap between your degree and the job market into a clear,
              personalized roadmap — built from your real coursework, resume, and practice.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-4">
                <HeroCTA
                  isAuthenticated={isAuthenticated}
                  startLabel="Get Started"
                  returningLabel="Go to Dashboard"
                  showArrow
                  className="group inline-flex items-center rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(32,56,16,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                />
                <a
                  href="#how-it-works"
                  className="rounded-xl border border-black/10 px-8 py-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary/40 hover:bg-white"
                >
                  See how it works
                </a>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Free to start · No credit card
              </p>
            </div>
          </FadeInSection>

          <FadeInSection className="relative mx-auto mt-14 max-w-4xl lg:mt-16" delay={0.15}>
            <HeroShowcase />
          </FadeInSection>
        </section>

        {/* Trust strip */}
        <section className="border-y border-black/5 py-10">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-6 sm:px-8 lg:px-10">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Built for Nepal&apos;s university students
            </span>
            <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <div className="animate-marquee flex whitespace-nowrap">
                {[...institutions, ...institutions].map((name, i) => (
                  <div key={`${name}-${i}`} className="px-10 text-xl font-bold text-neutral-300">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education gap stats */}
        <section className="bg-[#F7F8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] space-y-16 px-6 text-center sm:px-8 lg:px-10">
            <FadeInSection className="mx-auto max-w-2xl space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                The Education Gap
              </span>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Bridging the disconnect between degree and career.
              </h2>
            </FadeInSection>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
              {stats.map((item, i) => (
                <FadeInSection
                  key={item.stat}
                  delay={i * 0.1}
                  className="md:border-r md:border-black/5 md:px-8 md:last:border-r-0"
                >
                  <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                    {item.stat}
                  </div>
                  <p className="text-sm text-neutral-500">{item.text}</p>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <HowItWorksSection isAuthenticated={isAuthenticated} />

        {/* Adaptive roadmap */}
        <section className="overflow-hidden bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-14">
              <FadeInSection className="order-2 lg:order-1">
                <RoadmapShowcase />
              </FadeInSection>
              <FadeInSection className="order-1 space-y-6 lg:order-2" delay={0.1}>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Adaptive roadmap
                </span>
                <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                  A roadmap that keeps up with what you learn.
                </h2>
                <p className="text-base text-neutral-500">
                  Every subject you finish, every project you complete, and every mock
                  interview you pass updates your roadmap in real time — not a static PDF
                  you read once and forget.
                </p>
                <ul className="space-y-5">
                  {[
                    {
                      title: "Milestone-based",
                      text: "A clear path from Foundations to job-ready, broken into real stages.",
                    },
                    {
                      title: "Evidence-gated",
                      text: "Steps unlock only once you've actually studied the resources and practiced the skill.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h4 className="font-bold text-neutral-900">{item.title}</h4>
                        <p className="text-sm text-neutral-500">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="bg-[#F7F8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-10">
            <FadeInSection className="mx-auto mb-16 max-w-xl space-y-4 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                What&apos;s inside
              </span>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Everything from finding your gaps to landing the interview
              </h2>
            </FadeInSection>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <FadeInSection key={feature.title} delay={i * 0.08}>
                  <div className="group h-full rounded-2xl border border-black/5 bg-white p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                    <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h4 className="mb-2 font-bold text-neutral-900">{feature.title}</h4>
                    <p className="text-sm leading-relaxed text-neutral-500">
                      {feature.description}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-[1400px] px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10">
          <FadeInSection className="space-y-8 rounded-[32px] border border-black/5 bg-[#F7F8F5] p-12 sm:p-16 md:p-20">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-neutral-900 sm:text-5xl">
              Ready to stop guessing and start building?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-neutral-500">
              Set your target role and see your real skill gaps in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <HeroCTA
                isAuthenticated={isAuthenticated}
                startLabel="Get Started"
                returningLabel="Go to Dashboard"
                showArrow
                className="group inline-flex items-center rounded-xl bg-primary px-10 py-5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(32,56,16,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
              />
              <a
                href="#features"
                className="rounded-xl border border-black/10 px-10 py-5 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary/40 hover:bg-white"
              >
                See what&apos;s inside
              </a>
            </div>
          </FadeInSection>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
