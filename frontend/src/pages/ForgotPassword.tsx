import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

const mockSuccess = true;

const ForgotPassword = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link 
                        to="/login" 
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to login
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
                    <CardDescription>
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ForgotPasswordForm />

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Remember your password? {" "}
                            <Link to="/login" className="text-primary underline underline-offset-2">
                                Login in here
                            </Link>
                        </p>
                    </div>

                    {mockSuccess === true ? (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">Check your email</p>
                                    <p className="text-blue-700">
                                        After clicking "Send reset link", check your email for password reset instructions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-red-800">
                                    <p className="font-medium">we can't find your email</p>
                                    <p className="text-red-700">
                                        If you don't receive an email, please check your spam folder or try a different email address.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ForgotPassword