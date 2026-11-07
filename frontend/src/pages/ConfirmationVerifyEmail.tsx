import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { AlertCircle, ArrowRight, CheckCircle } from "lucide-react"
import { Link } from "@tanstack/react-router";
import { useConfirmationVerifyEmail } from "@/features/auth/hooks/useConfirmationVerifyEmail"
import { useNewVerificationMutation } from "@/features/auth/hooks/useNewVerificationMutation"

type ConfirmationVerifyEmailProps = {
    token: string;
    email: string;
}

const ConfirmationVerifyEmail = ({
    token, email
}: ConfirmationVerifyEmailProps) => {
    const { status, setStatus, query: { refetch, isFetching } } = useConfirmationVerifyEmail({ token });
    const { newVerificationSuccess, mutation: { mutate, isPending } } = useNewVerificationMutation({ setStatus });

    const getStatusContent = () => {
        switch (status) {
            case "verifying":
                return {
                    icon: <LoadingSpinner className="h-8 w-8 text-blue-600" />,
                    title: "Verifying your email...",
                    message: "Please wait while we confirm your email address.",
                    bgColor: "bg-blue-100",
                }
            case "success":
                return {
                    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                    title: "Email verified successfully!",
                    message: "Your account has been activated. You can now access all features.",
                    bgColor: "bg-green-100",
                }
            case "expired":
                return {
                    icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
                    title: "Verification link expired",
                    message: "This verification link has expired. Please request a new one.",
                    bgColor: "bg-orange-100",
                }
            case "error":
                return {
                    icon: <AlertCircle className="w-8 h-8 text-red-600" />,
                    title: "Verification failed",
                    message: "We couldn't verify your email. The link may be invalid or already used.",
                    bgColor: "bg-red-100",
                }
            default:
                return {
                    icon: <LoadingSpinner className="h-8 w-8 text-blue-600" />,
                    title: "Verifying...",
                    message: "Processing your request.",
                    bgColor: "bg-blue-100",
                }
        }
    }

    const statusContent = getStatusContent();


    return (
        <AuthLayout>
                <Card className="w-full max-w-md bg-card border-0">
                    <CardContent className="p-8 text-center">
                        <div
                        className={`w-16 h-16 ${statusContent.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
                        >
                            {statusContent.icon}
                        </div>

                        <h1 className="text-xl font-semibold text-gray-900 mb-2">{statusContent.title}</h1>
                        <p className="text-gray-600 mb-6">{statusContent.message}</p>

                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-600" />
                            </div>
                            <span className="text-sm font-medium">{email}</span>
                        </div>

                        <div className="space-y-3">
                            {status === "success" && (
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                    <Link to="/">
                                        Continue to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            )}
                            
                            {/* Handle when new Verification is Success */}
                            {status === "expired" && (
                                <div className="space-y-2">
                                    <Button onClick={() => mutate(email)} disabled={isPending || newVerificationSuccess}
                                    className="w-full bg-blue-600 hover:bg-blue-700">
                                        {isPending ? <LoadingSpinner /> : "Request new verification email"}
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent" asChild>
                                        <Link to="/login">
                                            Back to login
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="space-y-2">
                                    <Button 
                                    onClick={() => refetch()} disabled={isFetching}
                                    className="w-full bg-blue-600 hover:bg-blue-700">
                                        {isFetching ? <LoadingSpinner /> : "Try again"}
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent" asChild>
                                        <Link to="/">
                                            Back to FocusFlow
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {status === "success" && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700">
                                    Welcome to FocusFlow! Your account is now fully activated and ready to use.
                                </p>
                            </div>
                        )}

                        {status === "expired" && (
                            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-orange-700">
                                    Request a new verification link to confirm your email.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
        </AuthLayout>
    );
};

export default ConfirmationVerifyEmail;
