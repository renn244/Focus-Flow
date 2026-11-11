/** Confident deceleration shared by the landing and sign-in motion. */
export const ease = [0.16, 1, 0.3, 1] as const;

/** A short sequence for headline, supporting copy and actions. */
export const sequence = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.08 } },
};

export const rise = {
    hidden: { opacity: 0, y: 12 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
