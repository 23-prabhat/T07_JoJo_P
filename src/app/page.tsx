"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Shield,
  MagnifyingGlass,
  ChartBar,
  FileText,
  Lightbulb,
  Translate,
  Exam,
  ArrowRight,
  TelegramLogo,
  GoogleChromeLogo,
  Globe,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { UploadZone } from "@/components/UploadZone";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";
import type { Lang } from "@/lib/i18n";

// ─── animation presets ───────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const stagger = (delay = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger()}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── language pills ───────────────────────────────────────────────────────────
function LangPills() {
  const { lang, setLang } = useLanguage();
  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिं" },
    { code: "mr", label: "मर" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-foreground/10 bg-foreground/[0.03] p-0.5">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            lang === l.code
              ? "bg-warm text-warm-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// ─── navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-foreground/[0.06]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-warm text-warm-foreground">
            <Shield size={18} weight="bold" />
          </div>
          <span className="font-display text-xl tracking-tight text-foreground">
            ClearConsent
          </span>
        </a>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            {t.nav.howItWorks}
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            {t.nav.features}
          </a>
          <a href="#channels" className="transition-colors hover:text-foreground">
            {t.nav.channels}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <LangPills />
          <button
            onClick={toggle}
            className="flex size-8 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-all hover:border-warm/30 hover:text-warm cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 noise-bg" />
      <div className="pointer-events-none absolute top-20 -right-32 h-[500px] w-[500px] rounded-full bg-warm/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-warm/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-warm/10 px-4 py-1.5 text-sm font-medium text-warm"
          >
            <Shield size={15} weight="fill" />
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {t.hero.headline1}
            <br />
            {t.hero.headline2}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic text-warm">{t.hero.headline3}</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-warm/15 -rotate-1 rounded-sm" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            {t.hero.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-12 max-w-xl"
        >
          <UploadZone />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground/70"
        >
          {t.hero.trust}
        </motion.p>
      </div>
    </section>
  );
}

// ─── how it works ─────────────────────────────────────────────────────────────
const stepIcons = [FileText, MagnifyingGlass, ChartBar];

function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection>
          <motion.div
            variants={fadeUp}
            className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-foreground/10 pb-6 gap-3"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-warm">
              {t.howItWorks.label}
            </p>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
              {t.howItWorks.headline}
            </h2>
          </motion.div>

          <div className="divide-y divide-foreground/[0.06]">
            {t.howItWorks.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="group grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr_2fr] gap-6 sm:gap-10 py-10 items-start"
                >
                  {/* Number */}
                  <span className="font-mono text-4xl font-bold text-warm/25 sm:text-5xl group-hover:text-warm/50 transition-colors duration-500 leading-none pt-1">
                    {step.num}
                  </span>

                  {/* Title + icon */}
                  <div className="flex flex-col gap-4 sm:gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-warm/10 text-warm group-hover:bg-warm group-hover:text-warm-foreground transition-all duration-300">
                      <Icon size={20} weight="duotone" />
                    </div>
                    <h3 className="font-display text-xl text-foreground leading-snug">
                      {step.title}
                    </h3>
                    {/* desc on mobile here */}
                    <p className="text-sm leading-relaxed text-muted-foreground sm:hidden">
                      {step.desc}
                    </p>
                  </div>

                  {/* Desc desktop */}
                  <p className="hidden sm:block text-base leading-relaxed text-muted-foreground pt-1 max-w-md">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── features ─────────────────────────────────────────────────────────────────
const featureIcons = [ChartBar, Lightbulb, Shield, Exam, Translate, FileText];

function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 bg-foreground/[0.015]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-foreground/10 pb-6 gap-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-warm">
              {t.features.label}
            </p>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
              {t.features.headline}
            </h2>
          </motion.div>

          <div className="divide-y divide-foreground/[0.06]">
            {t.features.items.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group flex items-start gap-6 sm:gap-10 py-8"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warm/10 text-warm group-hover:bg-warm group-hover:text-warm-foreground transition-all duration-300">
                    <Icon size={20} weight="duotone" />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-8 items-start">
                    <h3 className="font-display text-lg text-foreground group-hover:text-warm transition-colors duration-300">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                  <span className="hidden sm:block font-mono text-xs text-muted-foreground/30 shrink-0 pt-1">
                    0{i + 1}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── channels ─────────────────────────────────────────────────────────────────
const channelIcons = [Globe, GoogleChromeLogo, TelegramLogo];
const channelAccents = [
  "from-warm/10 to-warm/5",
  "from-blue-500/10 to-blue-500/5",
  "from-sky-500/10 to-sky-500/5",
];
const channelIconColors = [
  "bg-warm/15 text-warm group-hover:bg-warm group-hover:text-warm-foreground",
  "bg-blue-500/15 text-blue-500 group-hover:bg-blue-500 group-hover:text-white",
  "bg-sky-500/15 text-sky-500 group-hover:bg-sky-500 group-hover:text-white",
];

function ChannelsSection() {
  const { t } = useLanguage();

  return (
    <section id="channels" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="mb-16 text-center max-w-xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-warm">
              {t.channels.label}
            </p>
            <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
              {t.channels.headline}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              {t.channels.subtitle}
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {t.channels.items.map((ch, i) => {
              const Icon = channelIcons[i];
              return (
                <motion.div
                  key={ch.title}
                  variants={fadeUp}
                  className={`group relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-gradient-to-br ${channelAccents[i]} p-8 transition-all duration-300 hover:border-foreground/10 hover:shadow-xl hover:-translate-y-1`}
                >
                  <span className="absolute top-4 right-4 rounded-full bg-background/60 backdrop-blur-sm border border-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground/60">
                    {ch.tag}
                  </span>

                  <div className={`mb-5 flex size-14 items-center justify-center rounded-2xl transition-all duration-300 ${channelIconColors[i]}`}>
                    <Icon size={28} weight="duotone" />
                  </div>

                  <h3 className="font-display text-xl text-foreground">
                    {ch.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {ch.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── cta ──────────────────────────────────────────────────────────────────────
function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 noise-bg" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-warm/[0.04] to-transparent" />

      <AnimatedSection className="relative mx-auto max-w-6xl px-6 text-center">
        <motion.h2
          variants={fadeUp}
          className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          {t.cta.headline}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-md text-base text-muted-foreground"
        >
          {t.cta.subtitle}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 rounded-full bg-warm px-8 py-3.5 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90 hover:shadow-lg hover:shadow-warm/20 cursor-pointer"
          >
            {t.cta.button}
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </motion.div>
      </AnimatedSection>
    </section>
  );
}

// ─── footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden bg-warm">
      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-0 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-warm-foreground/15">
            <Shield size={15} weight="bold" className="text-warm-foreground" />
          </div>
          <span className="font-display text-base text-warm-foreground/80">ClearConsent</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-warm-foreground/60">
          <a
            href="https://github.com"
            className="transition-colors hover:text-warm-foreground"
          >
            {t.footer.links.github}
          </a>
          <a
            href="https://twitter.com"
            className="transition-colors hover:text-warm-foreground"
          >
            {t.footer.links.twitter}
          </a>
          <a
            href="https://t.me"
            className="transition-colors hover:text-warm-foreground"
          >
            {t.footer.links.telegram}
          </a>
        </div>
      </div>

      {/* large wordmark */}
      <div className="relative px-4 pt-4 pb-0 max-w-6xl mx-auto overflow-hidden">
        <p className="font-display italic text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-bold text-warm-foreground/[0.12] select-none tracking-tight">
          ClearConsent
        </p>
      </div>

      {/* bottom bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 border-t border-warm-foreground/10 max-w-6xl mx-auto gap-2">
        <p className="text-xs text-warm-foreground/50">{t.footer.tagline}</p>
        <p className="text-xs text-warm-foreground/50">{t.footer.built}</p>
      </div>
    </footer>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ChannelsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
