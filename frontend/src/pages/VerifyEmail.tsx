import { Button } from "@/components/ui/button";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
import { ArrowLeft, Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";

type VerifyEmailProps = {
    email: string;
}

const VerifyEmail = ({
    email
} : VerifyEmailProps) => {
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
                <div
                className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-300 rounded-full opacity-35 animate-pulse"
                style={{ animationDelay: "1.5s" }}
                />
                <div
                className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-300 rounded-full opacity-45 animate-pulse"
                style={{ animationDelay: "2.5s" }}
                />

                <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-blue-400 opacity-15" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="8s"
                        repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="360 50 50;0 50 50"
                        dur="6s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute bottom-1/4 left-1/3 w-24 h-24 text-purple-400 opacity-12" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="10s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute top-1/2 right-1/3 w-20 h-20 text-cyan-400 opacity-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="4s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute top-1/3 left-1/5 w-16 h-16 text-cyan-400 opacity-20" viewBox="0 0 100 100">
                    <polygon
                    points="50,5 85,25 85,75 50,95 15,75 15,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.6"
                    />
                    <polygon
                    points="50,20 70,30 70,70 50,80 30,70 30,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                    />
                </svg>

                <svg className="absolute bottom-1/3 right-1/5 w-20 h-20 text-indigo-400 opacity-15" viewBox="0 0 100 100">
                    <polygon
                    points="50,10 80,30 80,70 50,90 20,70 20,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.5"
                    />
                </svg>
            </div>

            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Cloud</span>
                </div>
            </div>

            <div className="absolute top-8 right-8 z-10">
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                    <Link to="/sign-up">
                        <>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign Up
                        </>
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <VerifyEmailForm email={email} />
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>Waiting for verification...</span>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail