import type { z } from "zod";
import type { loginFormSchema } from "./components/LoginForm";
import type { signUpFormSchema } from "./components/SignUpForm";

export type loginSchema = z.infer<typeof loginFormSchema>;
export type signUpSchema = z.infer<typeof signUpFormSchema>;