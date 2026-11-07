import AuthLayout from "@/components/common/AuthLayout";
import { CheckCircle, Github, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useRedirectToken } from "@/features/auth/hooks/useRedirectToken";
 
type RedirectTokenProps = {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

const RedirectToken = ({
    accessToken, refreshToken, error
}: RedirectTokenProps) => {
    const { isLoading, errorMessage } = useRedirectToken({ accessToken, refreshToken, error });    

    return (
        <AuthLayout>
                <Card className="w-full max-w-sm bg-card border-0">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            {isLoading ? (
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner className="w-5 h-5 animate-spin text-indigo-600" />
                                    </div>
                                </div>
                            ) : (
                                errorMessage ? (
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <XCircle className="w-8 h-8 text-red-600" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                )
                            )}
                        </div>

                        {isLoading ? (
                            <h1 className="text-lg font-medium text-gray-700 mb-2">Signing in</h1>
                        ) : (
                            errorMessage ? (
                                <h1 className="text-lg font-medium text-red-700 mb-2">Error</h1>
                            ) : (
                                <h1 className="text-lg font-medium text-green-700 mb-2">Signed in successfully</h1>
                            )
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                                <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                </div>
                                <span className="text-sm font-medium">GitHub account</span>
                            </div>
                        ) : (
                            errorMessage ? (
                                <div className="flex items-center justify-center gap-2 bg-red-100 border border-red-300 rounded-md text-red-600 p-2">
                                    {errorMessage}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                                    <Github className="size-4" />
                                    <span className="text-sm font-medium">GitHub account</span>
                                </div>
                            )
                        )}

                    </CardContent>
                </Card>
        </AuthLayout>
    );
};

export default RedirectToken;
