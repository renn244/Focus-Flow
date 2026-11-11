import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";
import { useResendForgotPasswordMutation } from "../hooks/useResendForgotPasswordMutation";
import type { forgotPasswordSchema } from "../type";

export const forgotPasswordFormSchema = z.object({
    email: z.string().email()
})

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const form = useForm<forgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: { email: '' }
    })
    const { mutation: { mutate, isPending }, emailSent } = useForgotPasswordMutation<forgotPasswordSchema>(form.setError);
    const { mutation: { mutate: resend, isPending: isResending }, timeLeft } = useResendForgotPasswordMutation();
    
    const email = form.watch("email");

    const onSubmit = async (data: forgotPasswordSchema) => {
        try {
            mutate(data.email);
        } catch (error) {
            toast.error("An error occurred while sending the reset link. Please try again.");
        }
    }

    return (
        <Card className="w-full max-w-md bg-card border-0 gap-2">
            <CardHeader className="space-y-1 pb-6 gap-0">
                <div>
                    <Button
                    variant="ghost"
                    className="self-start text-gray-600 hover:text-gray-800 p-0 h-auto mb-4"
                    onClick={() => navigate({ to: '/login' })}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    {emailSent ? "Check your email" : "Forgot your password?"}
                </CardTitle>
                <p className="text-gray-600">
                    {emailSent
                    ? `We've sent a password reset link to ${email}`
                    : "No worries! Enter your email address and we'll send you a link to reset your password."}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {!emailSent ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input {...field} id="email" placeholder="johndoe24@example.com" className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />

                            <Button className="block w-full" disabled={isPending} type="submit">
                                {isPending ? <><LoadingSpinner className="size-4" /> Sending…</> : "Send reset link"}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-green-800">Email sent successfully!</h3>
                                    <p className="text-sm text-green-700 mt-1">
                                        Check your inbox and click the reset link to continue.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-blue-800 mb-2">Next steps:</h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Check your email inbox for the reset link</li>
                                        <li>• Click the link to create a new password</li>
                                        <li>• The link will expire in 24 hours</li>
                                        <li>• Check your spam folder if you don't see it</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
                            <Button
                            variant="outline"
                            onClick={() => resend(email)}
                            disabled={isResending || (typeof timeLeft !== 'undefined' && timeLeft > 0)}
                            className="w-full"
                            >
                                {isResending ? (
                                    <LoadingSpinner />
                                ) : (timeLeft && timeLeft > 0) ? (
                                    `Resend in ${timeLeft} seconds`
                                ) : (
                                    `Resend email`
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <p>
                        Remember your password? {" "}
                        <Link className="underline underline-offset-2 text-blue-700" to="/login">
                            Login
                        </Link>
                    </p>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p>
                        Need help? {" "}
                        <Link className="underline underline-offset-2 text-blue-700" to="/">
                            Contact support
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default ForgotPasswordForm
