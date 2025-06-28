import { CheckCircle, Leaf, XCircle } from "lucide-react";
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
         <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
            <div className="absolute inset-0 opacity-8">
                <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                    radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
                    radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 1px, transparent 0)
                    `,
                    backgroundSize: "50px 50px, 100px 100px",
                }}
                />
            </div>

            <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-12" viewBox="0 0 1200 800">
                    <defs>
                        <linearGradient id="codeFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path
                    d="M50,400 Q200,300 350,400 Q500,500 650,400 Q800,300 950,400 Q1100,500 1200,400"
                    fill="none"
                    stroke="url(#codeFlowGradient)"
                    strokeWidth="3"
                    opacity="0.7"
                    />
                    <path
                    d="M0,200 Q150,150 300,200 Q450,250 600,200 Q750,150 900,200 Q1050,250 1200,200"
                    fill="none"
                    stroke="url(#codeFlowGradient)"
                    strokeWidth="2"
                    opacity="0.5"
                    />
                    <path
                    d="M100,600 Q250,550 400,600 Q550,650 700,600 Q850,550 1000,600 Q1150,650 1200,600"
                    fill="none"
                    stroke="url(#codeFlowGradient)"
                    strokeWidth="1.5"
                    opacity="0.4"
                    />
                </svg>

                <div
                className="absolute top-32 left-32 w-4 h-4 bg-indigo-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "0s" }}
                />
                <div
                className="absolute top-48 right-40 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-pulse"
                style={{ animationDelay: "0.8s" }}
                />
                <div
                className="absolute bottom-40 left-48 w-5 h-5 bg-cyan-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "1.6s" }}
                />
                <div
                className="absolute bottom-32 right-32 w-3 h-3 bg-blue-400 rounded-full opacity-55 animate-pulse"
                style={{ animationDelay: "0.4s" }}
                />
                <div
                className="absolute top-1/2 left-1/5 w-4 h-4 bg-violet-400 rounded-full opacity-45 animate-pulse"
                style={{ animationDelay: "1.2s" }}
                />
                <div
                className="absolute top-2/3 right-1/4 w-3 h-3 bg-indigo-300 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "2s" }}
                />

                <svg className="absolute top-1/5 right-1/5 w-28 h-28 text-indigo-400 opacity-15" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="12s"
                        repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="360 50 50;0 50 50"
                        dur="8s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute bottom-1/5 left-1/4 w-24 h-24 text-purple-400 opacity-12" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="15s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute top-2/5 left-1/6 w-18 h-18 text-cyan-400 opacity-18" viewBox="0 0 100 100">
                    <polygon
                    points="50,8 82,25 82,75 50,92 18,75 18,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.6"
                    />
                    <polygon
                    points="50,25 70,35 70,65 50,75 30,65 30,35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    opacity="0.4"
                    />
                </svg>

                <svg className="absolute bottom-2/5 right-1/6 w-22 h-22 text-violet-400 opacity-16" viewBox="0 0 100 100">
                    <polygon
                    points="50,12 78,28 78,72 50,88 22,72 22,28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.5"
                    />
                </svg>

                <svg className="absolute top-1/2 right-1/2 w-16 h-16 text-blue-400 opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1,1">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="3s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </div>

            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Cloud</span>
                </div>
            </div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                    <CardContent className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">Cloud</span>
                        </div>

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
                                <span className="text-sm font-medium">Github Account</span>
                            </div>
                        ) : (
                            errorMessage ? (
                                <div className="flex items-center justify-center gap-2 bg-red-100 border border-red-300 rounded-md text-red-600 p-2">
                                    {errorMessage}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium">Github Account</span>
                                </div>
                            )
                        )}

                    </CardContent>
                </Card>
            </div>

            {isLoading && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span>Processing authentication...</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RedirectToken