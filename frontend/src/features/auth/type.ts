import type { z } from "zod";
import type { loginFormSchema } from "./components/LoginForm";
import type { signUpFormSchema } from "./components/SignUpForm";
import type { forgotPasswordFormSchema } from "./components/ForgotPasswordForm";
import type { changePasswordFormSchema } from "./components/ChangePasswordForm";

export type loginSchema = z.infer<typeof loginFormSchema>;
export type signUpSchema = z.infer<typeof signUpFormSchema>;
export type forgotPasswordSchema = z.infer<typeof forgotPasswordFormSchema>;
export type changePasswordSchema = z.infer<typeof changePasswordFormSchema>;