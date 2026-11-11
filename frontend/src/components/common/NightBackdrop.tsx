import { useId } from "react";
import { motion } from "framer-motion";
import { ease } from "@/features/landing/motion";

/**
 * The soft blue and violet light and the thin route line behind the landing
 * and sign-in pages. The line draws itself once, left to right.
 */
const NightBackdrop = ({ className = "h-[42rem]" }: { className?: string }) => {
  const gradientId = useId();
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}>
      <div className="absolute -left-48 -top-44 size-[36rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-[-14rem] top-20 size-[32rem] rounded-full bg-violet-500/[0.09] blur-3xl" />
      <svg className="absolute inset-x-0 top-20 h-80 w-full opacity-40" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
        <motion.path
          d="M-80 212C171 116 334 288 588 195C807 115 993 58 1241 142C1343 177 1410 148 1520 78"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.2, ease }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.42" stopColor="#60a5fa" stopOpacity="0.55" />
            <stop offset="0.75" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default NightBackdrop;
