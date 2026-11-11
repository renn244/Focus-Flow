import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import PasswordInput from "@/components/ui/passwordInput"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useChangePasswordMutation } from "../hooks/useChangePasswordMutation"
import type { changePasswordSchema } from "../type"

export const changePasswordFormSchema = z.object({
    newPassword: z.string()
        .min(8, { message: 'newPassword must be at least 8 characters long' }),
    confirmPassword: z.string()
        .min(8, { message: 'confirmPassword must be at least 8 characters long' }),
}).superRefine(({ newPassword, confirmPassword }, ctx) => {
    if(newPassword !== confirmPassword) {
        ctx.addIssue({
            path: ['confirmPassword'],
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
        })
    }
})

type ChangePasswordFormProps = {
    email: string;
    token: string;
}

const ChangePasswordForm = ({
    email, token
}: ChangePasswordFormProps) => {
    const navigate = useNavigate();
    const form = useForm<changePasswordSchema>({
        resolver: zodResolver(changePasswordFormSchema),
        defaultValues: { newPassword: '', confirmPassword: '' }
    })
    const { mutate, isPending } = useChangePasswordMutation<changePasswordSchema>(form.setError)

    const onSubmit = async (data: changePasswordSchema) => {
        try {
            mutate({ ...data, email, token });
        } catch {
            toast.error("An error occurred while changing the password")
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
                <CardTitle className="text-2xl font-bold text-gray-900">Change your password</CardTitle>
                <p className="text-gray-600">Update your password to keep your account secure</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField 
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                        {/* Password Requirements */}
                        {/* {formData.newPassword && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h4>
                                <div className="space-y-2">
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                req.met ? "bg-green-100" : "bg-gray-200"
                                            }`}
                                            >
                                                {req.met && <CheckCircle className="w-3 h-3 text-green-600" />}
                                            </div>
                                            <span className={`text-xs ${req.met ? "text-green-700" : "text-gray-600"}`}>{req.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        <Button
                        type="submit" disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                        {isPending ? (
                                <LoadingSpinner />
                            ) : (
                                <div className="flex items-center gap-2">
                                    Change password
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default ChangePasswordForm
