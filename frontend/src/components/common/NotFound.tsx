import type React from "react"
import { Leaf, Home, ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link, useNavigate } from "@tanstack/react-router";

interface NotFoundProps {
    title?: string
    message?: string
    showBackButton?: boolean
    customActions?: React.ReactNode
}

export default function NotFound({
    title = "Page Not Found",
    message = "Looks like this page took a detour from our roadmap. Let's get you back on track!",
    showBackButton = true,
    customActions,
}: NotFoundProps) {
    const navigate = useNavigate();
    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back()
        } else {
            navigate({ to: "/" });
        }
    }

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
                        <linearGradient id="brokenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                    </defs>

                    <path
                    d="M100,200 Q300,100 400,200"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    opacity="0.3"
                    />
                    <path
                    d="M600,300 Q800,200 1000,300"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    opacity="0.3"
                    />

                    <path
                    d="M450,180 Q500,150 550,180"
                    fill="none"
                    stroke="url(#brokenGradient)"
                    strokeWidth="3"
                    opacity="0.6"
                    strokeDasharray="8,4"
                    >
                        <animate attributeName="stroke-dashoffset" values="0;12" dur="2s" repeatCount="indefinite" />
                    </path>

                    <path
                    d="M0,400 Q200,300 350,400"
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                    opacity="0.4"
                    />
                    <path
                    d="M450,420 Q600,350 750,420"
                    fill="none"
                    stroke="url(#brokenGradient)"
                    strokeWidth="2"
                    opacity="0.5"
                    strokeDasharray="6,6"
                    >
                        <animate attributeName="stroke-dashoffset" values="12;0" dur="1.5s" repeatCount="indefinite" />
                    </path>
                    <path
                    d="M850,400 Q1000,350 1200,400"
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
                <div
                className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "0.5s" }}
                />

                <div
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-400 rounded-full opacity-60 animate-pulse"
                style={{ animationDelay: "0.8s", animationDuration: "1s" }}
                />
                <div
                className="absolute top-1/3 right-1/3 w-3 h-3 bg-orange-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "1.2s", animationDuration: "1.2s" }}
                />

                <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-blue-400 opacity-15" viewBox="0 0 100 100">
                    <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.6"
                    >
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="20s"
                        repeatCount="indefinite"
                        />
                    </circle>
                    <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="3,6"
                    opacity="0.4"
                    >
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="360 50 50;0 50 50"
                        dur="8s"
                        repeatCount="indefinite"
                        />
                    </circle>
                </svg>

                <svg className="absolute bottom-1/3 left-1/4 w-24 h-24 text-purple-400 opacity-12" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="15s"
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
                    strokeDasharray="4,4"
                    opacity="0.6"
                    />
                </svg>

                <svg className="absolute bottom-1/3 right-1/5 w-20 h-20 text-red-400 opacity-15" viewBox="0 0 100 100">
                    <polygon
                    points="50,10 80,30 80,70 50,90 20,70 20,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="6,3"
                    opacity="0.5"
                    >
                        <animate attributeName="stroke-dashoffset" values="0;9" dur="3s" repeatCount="indefinite" />
                    </polygon>
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

            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                    <CardContent className="p-8 text-center">

                        <div className="relative mb-2">
                            <div className="text-7xl font-bold text-blue-600 mb-2 animate-pulse">404</div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

                        {/* <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-blue-700 font-medium">Team Active</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <GitBranch className="w-5 h-5 text-red-600 mx-auto mb-1" />
                                <p className="text-xs text-red-700 font-medium">Route Missing</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <p className="text-xs text-green-700 font-medium">Goals Clear</p>
                            </div>
                        </div> */}

                        <div className="space-y-3">
                            {customActions ? (
                                customActions
                            ) : (
                                <>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                        <Link to="/">
                                            <Home className="w-4 h-4 mr-2" />
                                            Return to Dashboard
                                        </Link>
                                    </Button>

                                    <div className="grid grid-cols-2 gap-3">
                                        {showBackButton && (
                                            <Button variant="outline" onClick={handleGoBack} className="text-gray-700 bg-transparent">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Go Back
                                            </Button>
                                        )}
                                        <Button variant="outline" className="text-gray-700 bg-transparent" asChild>
                                            <Link to="/">
                                                <Users className="w-4 h-4 mr-2" />
                                                Contact Team
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <span>Sprint continues • Team collaboration active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}