import { useState } from "react"
import { easeInOut, motion } from "framer-motion";
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Calendar, CheckCircle, Menu, MessageSquare, Play, Shield, Star, Users, X, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
}

const floatingAnimation = {
    animate: {
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        rotate: [0, 180, 360],
        transition: {
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
        },
    },
}

const pulseAnimation = {
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
        transition: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: easeInOut,
        },
    },
}

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                variants={floatingAnimation}
                animate="animate"
                className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                />
                <motion.div
                variants={floatingAnimation}
                animate="animate"
                style={{ animationDelay: "2s" }}
                className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
                />
                <motion.div
                variants={floatingAnimation}
                animate="animate"
                style={{ animationDelay: "4s" }}
                className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
                />
                <motion.div
                variants={floatingAnimation}
                animate="animate"
                style={{ animationDelay: "6s" }}
                className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"
                />

                <motion.div
                variants={pulseAnimation}
                animate="animate"
                className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/40 rounded-full"
                />
                <motion.div
                variants={pulseAnimation}
                animate="animate"
                style={{ animationDelay: "1s" }}
                className="absolute top-1/3 right-1/3 w-6 h-6 bg-purple-500/40 rounded-full"
                />
                <motion.div
                variants={pulseAnimation}
                animate="animate"
                style={{ animationDelay: "2s" }}
                className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-500/40 rounded-full"
                />
                <motion.div
                variants={pulseAnimation}
                animate="animate"
                style={{ animationDelay: "3s" }}
                className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-indigo-500/40 rounded-full"
                />

                <motion.div
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
                className="absolute top-1/2 left-10 w-8 h-8 border-2 border-blue-400/30 rotate-45"
                />
                <motion.div
                animate={{
                    rotate: [360, 0],
                    scale: [1, 0.9, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
                className="absolute top-3/4 right-20 w-6 h-6 border-2 border-purple-400/30 rotate-12"
                />
            </div>

            <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                            >
                                <Zap className="w-5 h-5 text-white" />
                            </motion.div>
                            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ProjectFlow
                            </span>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {["Features", "Pricing", "About", "Contact"].map((item) => (
                                    <motion.a
                                    key={item}
                                    whileHover={{ y: -2 }}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        {item}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <Button variant="ghost">Sign In</Button>
                            <motion.div {...scaleOnHover}>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    Get Started
                                </Button>
                            </motion.div>
                        </div>

                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <motion.div
                initial={false}
                animate={mobileMenuOpen ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden bg-white/90 backdrop-blur-md border-t border-gray-200/50"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {["Features", "Pricing", "About", "Contact"].map((item) => (
                            <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                            onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-4 pb-2 space-y-2">
                            <Button variant="ghost" className="w-full">
                                Sign In
                            </Button>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Get Started</Button>
                        </div>
                    </div>
                </motion.div>
            </motion.nav>

            <section className="relative py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        >
                            <Badge
                            variant="secondary"
                            className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                            >
                                🚀 New: AI-powered task automation
                            </Badge>
                        </motion.div>

                        <motion.h1 {...fadeInUp} className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                            Manage Projects Like a
                            <motion.span
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent block"
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                Pro
                            </motion.span>
                        </motion.h1>

                        <motion.p
                        {...fadeInUp}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                        >
                            Streamline your workflow, collaborate seamlessly, and deliver projects on time. The all-in-one project
                            management solution trusted by teams worldwide.
                        </motion.p>

                        <motion.div
                        {...fadeInUp}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <motion.div {...scaleOnHover}>
                                <Button
                                size="lg"
                                className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                            <motion.div {...scaleOnHover}>
                                <Button
                                variant="outline"
                                size="lg"
                                className="text-lg px-8 py-3 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white"
                                >
                                    <Play className="mr-2 w-5 h-5" />
                                    Watch Demo
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-16"
                        >
                            <div className="relative">
                                <img
                                src="/placeholder.svg?height=600&width=1000&text=ProjectFlow+Dashboard"
                                alt="ProjectFlow Dashboard"
                                className="rounded-lg shadow-2xl mx-auto max-w-full relative z-10"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-lg"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 bg-white/80 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to help your team collaborate better and deliver faster.
                        </p>
                    </motion.div>

                    <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Users,
                                title: "Team Collaboration",
                                description: "Work together seamlessly with real-time updates, comments, and file sharing.",
                                gradient: "from-blue-500 to-cyan-500",
                            },
                            {
                                icon: BarChart3,
                                title: "Advanced Analytics",
                                description: "Track progress, measure performance, and make data-driven decisions.",
                                gradient: "from-purple-500 to-pink-500",
                            },
                            {
                                icon: Calendar,
                                title: "Smart Scheduling",
                                description: "AI-powered scheduling that adapts to your team's availability and priorities.",
                                gradient: "from-indigo-500 to-blue-500",
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                description: "Bank-level security with SSO, 2FA, and compliance certifications.",
                                gradient: "from-green-500 to-teal-500",
                            },
                            {
                                icon: MessageSquare,
                                title: "Integrated Communication",
                                description: "Built-in chat, video calls, and notifications keep everyone connected.",
                                gradient: "from-orange-500 to-red-500",
                            },
                            {
                                icon: Zap,
                                title: "Automation",
                                description: "Automate repetitive tasks and workflows to focus on what matters most.",
                                gradient: "from-yellow-500 to-orange-500",
                            },
                        ].map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp} whileHover={{ y: -10 }} className="group">
                                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <motion.div
                                        whileHover={{ rotate: 30 }}
                                        transition={{ duration: 0.1 }}
                                        className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                        >
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50/50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by teams worldwide</h2>
                        <p className="text-xl text-gray-600">See what our customers have to say about ProjectFlow</p>
                    </motion.div>

                    <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Product Manager at TechCorp",
                                avatar: "/placeholder.svg?height=40&width=40",
                                content:
                                "ProjectFlow transformed how our team collaborates. We've increased our delivery speed by 40% since switching.",
                                rating: 5,
                            },
                            {
                                name: "Michael Chen",
                                role: "CTO at StartupXYZ",
                                avatar: "/placeholder.svg?height=40&width=40",
                                content: "The automation features are incredible. We save hours every week on routine tasks.",
                                rating: 5,
                            },
                            {
                                name: "Emily Rodriguez",
                                role: "Team Lead at DesignStudio",
                                avatar: "/placeholder.svg?height=40&width=40",
                                content: "Best project management tool we've ever used. The interface is intuitive and powerful.",
                                rating: 5,
                            },
                        ].map((testimonial) => (
                            <motion.div
                            key={testimonial.name}
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                                <div className="flex items-center">
                                    <Avatar className="w-10 h-10 mr-3">
                                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                            {testimonial.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section id="pricing" className="py-20 bg-white/80 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
                        <p className="text-xl text-gray-600">Choose the plan that's right for your team</p>
                    </motion.div>

                    <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                name: "Starter",
                                price: "$9",
                                period: "per user/month",
                                description: "Perfect for small teams getting started",
                                features: ["Up to 10 team members", "Unlimited projects", "Basic reporting", "Email support"],
                                popular: false,
                            },
                            {
                                name: "Professional",
                                price: "$19",
                                period: "per user/month",
                                description: "Advanced features for growing teams",
                                features: [
                                "Up to 50 team members",
                                "Advanced analytics",
                                "Custom workflows",
                                "Priority support",
                                "API access",
                                ],
                                popular: true,
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                period: "contact us",
                                description: "Tailored solutions for large organizations",
                                features: [
                                "Unlimited team members",
                                "Advanced security",
                                "Custom integrations",
                                "Dedicated support",
                                "SLA guarantee",
                                ],
                                popular: false,
                            },
                        ].map((plan) => (
                            <motion.div key={plan.name} variants={fadeInUp} whileHover={{ y: -10 }} className="relative">
                                {plan.popular && (
                                    <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                                    >
                                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Most Popular</Badge>
                                    </motion.div>
                                )}
                                <Card
                                className={`h-full bg-white/90 backdrop-blur-sm ${plan.popular ? "border-2 border-blue-600 shadow-xl" : "border border-gray-200"}`}
                                >
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {plan.price}
                                            </span>
                                            <span className="text-gray-600">/{plan.period}</span>
                                        </div>
                                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, featureIndex) => (
                                                <motion.li
                                                key={featureIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: featureIndex * 0.1 }}
                                                className="flex items-center"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                    <span className="text-gray-600">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <motion.div {...scaleOnHover}>
                                            <Button
                                            className={`w-full ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}`}
                                            variant={plan.popular ? "default" : "outline"}
                                            >
                                                {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                                            </Button>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
                
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                    className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                        className="absolute bottom-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-xl"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform your workflow?</h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of teams already using ProjectFlow to deliver better results faster.
                        </p>
                        <motion.div {...scaleOnHover} className="inline-block">
                            <Button
                            size="lg"
                            variant="secondary"
                            className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
                            >
                                Start Your Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            
            <footer className="bg-gray-900 text-white py-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-8"
                    >
                        <motion.div variants={fadeInUp}>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="ml-2 text-xl font-bold">ProjectFlow</span>
                            </div>
                            <p className="text-gray-400">
                                The modern project management solution for teams that want to achieve more.
                            </p>
                        </motion.div>

                        {[
                            {
                                title: "Product",
                                links: ["Features", "Pricing", "Security", "Integrations"],
                            },
                            {
                                title: "Company",
                                links: ["About", "Blog", "Careers", "Contact"],
                            },
                            {
                                title: "Support",
                                links: ["Help Center", "Documentation", "API", "Status"],
                            },
                        ].map((section) => (
                            <motion.div key={section.title} variants={fadeInUp}>
                                <h3 className="font-semibold mb-4">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.map((link) => (
                                        <li key={link}>
                                            <motion.a
                                            whileHover={{ x: 5 }}
                                            href="#"
                                            className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link}
                                            </motion.a>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div {...fadeInUp} className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 FocusFlow. All rights reserved.</p>
                    </motion.div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage