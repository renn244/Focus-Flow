import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { CheckCircle, Clock, Leaf, Mail, Shield } from "lucide-react";

const ForgotPassword = () => {
    
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
            </div>

            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Cloud</span>
                </div>
            </div>

            <div className="flex min-h-screen">
                <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                    <div className="max-w-md text-center text-white space-y-8">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Shield className="w-8 h-8 text-blue-300" />
                            </div>
                            <h2 className="text-3xl font-bold">Secure Recovery</h2>
                            <p className="text-lg text-blue-100">
                                Your account security is our priority. We use industry-standard encryption to protect your data.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Secure Links</h3>
                                    <p className="text-sm text-blue-200">Reset links expire after 24 hours for security</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Email Verification</h3>
                                    <p className="text-sm text-blue-200">We only send reset links to verified email addresses</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-cyan-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Quick Process</h3>
                                    <p className="text-sm text-blue-200">Reset your password in under 2 minutes</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-blue-100 text-sm">
                                    <strong>Need immediate help?</strong>
                                    <br />
                                    Contact our support team 24/7 for urgent account issues.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword