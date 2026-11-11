import type { PropsWithChildren } from "react";
import { Link } from "@tanstack/react-router";
import Brand from "./Brand";
import AuthIntro, { type AuthIntroVariant } from "./AuthIntro";
import { cn } from "@/lib/utils";
import { MotionConfig, motion } from "framer-motion";
import { ease } from "@/features/landing/motion";

type AuthLayoutProps = PropsWithChildren<{ variant?: AuthIntroVariant }>;

const AuthLayout = ({ children, variant }: AuthLayoutProps) => (
  <MotionConfig reducedMotion="user">
  <div className={cn("auth-layout flex min-h-svh flex-col bg-[#08142d]", variant && "auth-layout-split")}>
    <header className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <Link to="/" aria-label="FocusFlow home" className="inline-flex rounded-lg text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">
        <Brand />
      </Link>
    </header>
    <main className={cn("mx-auto w-full max-w-7xl flex-1 px-5 pb-12 pt-4 sm:px-8 sm:pb-16 lg:px-10",
      variant ? "grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:py-10" : "flex items-center justify-center")}>
      {variant && <AuthIntro variant={variant} />}
      <motion.div
        className="flex w-full min-w-0 items-center justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: variant ? 0.2 : 0, ease }}
      >
        {children}
      </motion.div>
    </main>
  </div>
  </MotionConfig>
);

export default AuthLayout;
