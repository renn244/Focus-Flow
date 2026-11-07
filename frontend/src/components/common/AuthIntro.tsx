import { CalendarDays, FolderKanban, UsersRound } from "lucide-react";

export type AuthIntroVariant = "login" | "signup";

const highlights = [
  {
    icon: FolderKanban,
    title: "A clear next step",
    description: "Projects, boards, and assignments in one shared workspace.",
    accent: "text-blue-300 bg-blue-400/10",
  },
  {
    icon: UsersRound,
    title: "Your team, on the same page",
    description: "Conversations and supporting files stay with the work.",
    accent: "text-violet-300 bg-violet-400/10",
  },
  {
    icon: CalendarDays,
    title: "Room to focus on today",
    description: "Due dates and your assigned tasks, without the extra noise.",
    accent: "text-cyan-300 bg-cyan-400/10",
  },
];

const AuthIntro = ({ variant }: { variant: AuthIntroVariant }) => (
  <section className="mx-auto w-full max-w-lg text-center lg:mx-0 lg:text-left" aria-label="About FocusFlow">
    <h1 className="text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-5xl lg:leading-[1.15]">
      {variant === "login" ? <>Focus on the work<br className="hidden lg:block" /> that matters.</> : <>A shared workspace.<br className="hidden lg:block" /> A clearer next step.</>}
    </h1>
    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7 lg:mx-0 lg:mt-5">
      {variant === "login"
        ? "Pick up where you left off. Your projects, your people, and the work ahead are all here."
        : "Bring your project and your people together. Make the next task easier to find, and keep the whole team moving."}
    </p>
    <ul className="mt-10 hidden space-y-7 lg:block">
      {highlights.map(({ icon: Icon, title, description, accent }) => (
        <li key={title} className="flex items-start gap-4">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-blue-50">{title}</h2>
            <p className="mt-1 max-w-xs text-sm leading-6 text-blue-100/75">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default AuthIntro;
