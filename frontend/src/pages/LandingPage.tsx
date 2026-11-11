import { Link } from "@tanstack/react-router"
import { MotionConfig, motion } from "framer-motion"
import {
  ArrowRight,
  CalendarDays,
  Check,
  FolderKanban,
  Leaf,
  ListChecks,
} from "lucide-react"
import FeatureSections from "@/features/landing/FeatureSections"
import ProductPreview from "@/features/landing/ProductPreview"
import { ease, rise, sequence } from "@/features/landing/motion"

function Brand() {
  return (
    <div className="flex items-center gap-2.5 text-white">
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500 shadow-[0_8px_24px_rgba(59,130,246,0.35)]">
        <Leaf className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-[-0.02em]">FocusFlow</span>
    </div>
  )
}

function WorkflowStep({
  icon: Icon,
  title,
  description,
  isLast = false,
}: {
  icon: typeof FolderKanban
  title: string
  description: string
  isLast?: boolean
}) {
  return (
    <motion.div variants={step} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0">
      {!isLast ? <motion.span variants={connector} className="absolute left-[1.18rem] top-10 h-[calc(100%-1.5rem)] w-px origin-top bg-gradient-to-b from-blue-400/70 to-violet-400/15" /> : null}
      <span className="relative z-10 flex size-10 items-center justify-center rounded-xl border border-blue-300/15 bg-blue-500/10 text-blue-200">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="pt-1.5">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-blue-100/65">{description}</p>
      </div>
    </motion.div>
  )
}

/** The route from plan to next step is walked once, top to bottom, as it scrolls into view. */
const steps = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.22 } },
}

const step = {
  hidden: { opacity: 0, x: -8 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
}

const connector = {
  hidden: { scaleY: 0 },
  shown: { scaleY: 1, transition: { duration: 0.5, delay: 0.15, ease } },
}

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen overflow-hidden bg-[#08142d] text-blue-50 selection:bg-blue-400/35">
      {/*
        THESIS: A calm, concrete path from a project board to today's work; reject generic SaaS feature grids.
        OWN-WORLD: FocusFlow's established deep navy field, precise blue/violet/cyan accents, and restrained rounded surfaces.
        STORY: A visitor understands that FocusFlow makes shared project work actionable, then chooses to create an account or sign in.
        FIRST VIEWPORT: Minimal header, centred statement, primary action, and the real app (board + My work) rendered with sample data.
        FORM: Full-width agenda evidence composition, candidate 7; seed 6c3007eb. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] overflow-hidden">
        <div className="absolute -left-48 -top-44 size-[36rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-14rem] top-20 size-[32rem] rounded-full bg-violet-500/[0.09] blur-3xl" />
        <svg className="absolute inset-x-0 top-20 h-80 w-full opacity-40" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
          <path d="M-80 212C171 116 334 288 588 195C807 115 993 58 1241 142C1343 177 1410 148 1520 78" stroke="url(#landing-path)" strokeWidth="1.2" />
          <defs>
            <linearGradient id="landing-path" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="0.42" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="0.75" stopColor="#a78bfa" stopOpacity="0.45" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" aria-label="FocusFlow home"><Brand /></Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-blue-100/75 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">
            Log in
          </Link>
          <Link to="/sign-up" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,130,246,0.28)] transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200">
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24">
        <motion.div variants={sequence} initial="hidden" animate="shown" className="mx-auto max-w-3xl text-center">
          <motion.h1 variants={rise} className="text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Focus on the work that matters.
          </motion.h1>
          <motion.p variants={rise} className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-blue-100/75 sm:text-lg sm:leading-8">
            Keep projects, task boards, assignments, and due dates together—so your next step is always clear.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/sign-up" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(59,130,246,0.3)] transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200">
              Create your workspace <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-blue-200/25 px-5 text-sm font-semibold text-blue-50 transition hover:border-blue-200/45 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200">
              Log in
            </Link>
          </motion.div>
        </motion.div>
        <ProductPreview />
      </section>

      <FeatureSections />

      <section id="how-it-works" className="relative border-y border-white/[0.07] bg-[#0a1834]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-10 lg:py-28">
          <div className="lg:pt-2">
            <h2 className="max-w-md text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              From a project plan to a clear next step.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-blue-100/65">
              FocusFlow keeps the everyday pieces of team work in one place. Build the board, give tasks a date, then come back to the work that needs you now.
            </p>
            <a href="#start" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
              See the flow <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <motion.div id="start" className="max-w-xl" variants={steps} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.4 }}>
            <WorkflowStep icon={FolderKanban} title="Create a project" description="Start with a shared project space and give your team one place to organise the work." />
            <WorkflowStep icon={ListChecks} title="Build the board" description="Break the plan into tasks, move work through the board, and keep responsibilities visible." />
            <WorkflowStep icon={CalendarDays} title="Set a due date" description="Give important work a date so the team can see what is coming up." />
            <WorkflowStep icon={Check} title="Return to what matters" description="Use your personal view to pick up the next task instead of searching through the whole project." isLast />
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="flex flex-col justify-between gap-8 rounded-2xl border border-blue-300/15 bg-gradient-to-br from-blue-500/15 via-[#112956] to-violet-500/10 px-6 py-9 sm:px-10 sm:py-11 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Make the next task easier to find.</h2>
            <p className="mt-3 text-base leading-7 text-blue-100/70">Set up a workspace for your project, then bring your work into focus.</p>
          </div>
          <Link to="/sign-up" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(59,130,246,0.3)] transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200">
            Get started <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-blue-100/55 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Brand />
          <div className="flex items-center gap-5">
            <a href="#features" className="transition hover:text-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200">Features</a>
            <a href="#how-it-works" className="transition hover:text-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200">How it works</a>
            <Link to="/login" className="transition hover:text-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200">Log in</Link>
          </div>
        </div>
      </footer>
    </main>
    </MotionConfig>
  )
}
