import { motion } from "framer-motion";
import { DndContext } from "@dnd-kit/core";
import AgendaPanel from "@/components/layout/AgendaPanel";
import ColumnCard from "@/features/projectWorkSpace/components/Column/ColumnCard";
import DemoProviders from "@/features/landing/DemoProviders";
import { demoColumns } from "@/features/landing/demoData";
import { ease, rise, sequence } from "@/features/landing/motion";

export type AuthIntroVariant = "login" | "signup";

const copy = {
  login: {
    title: <>Focus on the work<br className="hidden lg:block" /> that matters.</>,
    body: "Pick up where you left off. Your agenda for today is waiting, across every project you're in.",
    caption: "Your agenda in FocusFlow, shown with sample data.",
  },
  signup: {
    title: <>A shared workspace.<br className="hidden lg:block" /> A clearer next step.</>,
    body: "Bring your project and your people together. Every task has an owner, a date and a checklist, so the next step is easy to find.",
    caption: "A board column in FocusFlow, shown with sample data.",
  },
};

/** Login shows the personal agenda; sign-up shows a board column. Both are the real components. */
const Glimpse = ({ variant }: { variant: AuthIntroVariant }) => (
  <motion.figure
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.35, ease }}
    className="mt-10 hidden max-w-md lg:block"
  >
    <div className="rounded-2xl border border-blue-300/15 bg-[#0b1630] p-1.5 shadow-[0_24px_64px_rgba(0,0,0,0.38)]">
      <DemoProviders>
        <div inert className="select-none overflow-hidden rounded-[10px] text-left text-foreground">
          {variant === "login" ? (
            <div className="h-[18.5rem] bg-shell-raised [&_.shell-scroll]:overflow-hidden">
              <AgendaPanel />
            </div>
          ) : (
            <div className="bg-[#f4f6fb] p-3">
              <DndContext>
                <ColumnCard column={demoColumns[1]} />
              </DndContext>
            </div>
          )}
        </div>
      </DemoProviders>
    </div>
    <figcaption className="mt-3 text-xs text-blue-200/55">{copy[variant].caption}</figcaption>
  </motion.figure>
);

const AuthIntro = ({ variant }: { variant: AuthIntroVariant }) => (
  <motion.section variants={sequence} initial="hidden" animate="shown" className="mx-auto w-full max-w-lg text-center lg:mx-0 lg:text-left" aria-label="About FocusFlow">
    <motion.h1 variants={rise} className="text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl lg:text-5xl lg:leading-[1.1]">
      {copy[variant].title}
    </motion.h1>
    <motion.p variants={rise} className="mx-auto mt-4 max-w-md text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7 lg:mx-0 lg:mt-5">
      {copy[variant].body}
    </motion.p>
    <Glimpse variant={variant} />
  </motion.section>
);

export default AuthIntro;
