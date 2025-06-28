import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Mail } from "lucide-react"
import { useResendVerificationEmailMutation } from "../hooks/useVerifyEmail";
import LoadingSpinner from "@/components/ui/loadingSpinner";

type VerifyEmailFormProps = {
    email: string;
}

const VerifyEmailForm = ({
    email
}: VerifyEmailFormProps) => {
    const { mutate: resendEmail, isPending, error } = useResendVerificationEmailMutation(); 

    return (
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    We've sent a verification link to your email address. Please check your inbox and click the link to verify
                    your account.
                </p>

                <div className="bg-gray-50 rounded-lg p-2 mb-4 border border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{email}</span>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{error.message}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                    onClick={() => resendEmail(email)}
                    disabled={isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isPending ? (
                            <LoadingSpinner />
                        ) : (
                            "Resend verification email"
                        )}
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Didn't receive the email?</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Check your spam or junk folder</li>
                        <li>• Make sure {email} is correct</li>
                        <li>• Try resending the verification email</li>
                    </ul>
                </div>

                <div className="mt-4">
                    <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm">
                        Need help? Contact support
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default VerifyEmailForm