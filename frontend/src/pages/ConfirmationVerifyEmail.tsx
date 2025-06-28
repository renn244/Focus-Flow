import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { AlertCircle, ArrowRight, CheckCircle, Leaf } from "lucide-react"
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
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            <div className="absolute inset-0 opacity-10">
                <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
                />
            </div>

            <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800">
                    <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path
                    d="M100,200 Q300,100 500,200 T900,300 Q1100,200 1200,400"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    opacity="0.6"
                    />
                    <path
                    d="M0,400 Q200,300 400,400 T800,500 Q1000,400 1200,600"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                    opacity="0.4"
                    />
                    <path
                    d="M200,100 Q400,50 600,150 T1000,200"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1"
                    opacity="0.3"
                    />
                </svg>

                <div
                className="absolute top-20 left-20 w-3 h-3 bg-blue-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "0s" }}
                />
                <div
                className="absolute top-40 right-32 w-2 h-2 bg-purple-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "1s" }}
                />
                <div
                className="absolute bottom-32 left-40 w-4 h-4 bg-cyan-400 rounded-full opacity-30 animate-pulse"
                style={{ animationDelay: "2s" }}
                />
                <div
                className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "0.5s" }}
                />
            </div>

            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Cloud</span>
                </div>
            </div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
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
                                            Contact support
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {status === "success" && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700">
                                    🎉 Welcome to Cloud! Your account is now fully activated and ready to use.
                                </p>
                            </div>
                        )}

                        {status === "expired" && (
                            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-orange-700">
                                    ⏰ Verification links expire after 24 hours for security reasons.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    {status === "verifying" && (
                        <>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div
                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                    />
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>Verifying token...</span>
                        </>
                    )}
                    {status === "success" && (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Verification complete</span>
                        </>
                    )}
                    {(status === "error" || status === "expired") && (
                        <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span>Verification failed</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConfirmationVerifyEmail