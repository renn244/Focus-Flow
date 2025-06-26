import LoginForm from "@/features/auth/components/LoginForm"
import { Leaf, Target, Users, Zap } from "lucide-react"

const Login = () => {
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

                <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-blue-400 opacity-15" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="20s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute bottom-1/3 left-1/4 w-16 h-16 text-cyan-400 opacity-20" viewBox="0 0 100 100">
                    <polygon
                    points="50,5 85,25 85,75 50,95 15,75 15,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.6"
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

            <div className="flex min-h-screen">
                <div className="flex-1 flex items-center justify-center p-8">
                    <LoginForm />
                </div>

                <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                    <div className="max-w-md text-center text-white space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Collaborate Better</h2>
                            <p className="text-lg text-blue-100">
                                Join thousands of teams using our platform to manage projects, track progress, and deliver results.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Team Collaboration</h3>
                                    <p className="text-sm text-blue-200">Work together seamlessly with real-time updates</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Agile Workflows</h3>
                                    <p className="text-sm text-blue-200">Sprint planning, retrospectives, and more</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-6 h-6 text-cyan-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-100">Goal Tracking</h3>
                                    <p className="text-sm text-blue-200">Monitor progress and achieve your objectives</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex items-center justify-center gap-2 text-blue-200 text-sm">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white" />
                                    <div className="w-8 h-8 bg-purple-400 rounded-full border-2 border-white" />
                                    <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-white" />
                                </div>
                                <span>Join 10,000+ happy users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login