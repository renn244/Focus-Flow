import LoginForm from "@/features/auth/components/LoginForm"

const Login = () => {
    return (
        <div className="flex h-screen w-full">
            {/* login card */}
            <div className="flex w-full md:w-1/2 items-center justify-center">
                <div className="flex flex-col w-full max-w-[336px] sm:max-w-[472px] max-h-[704px] md:p-6">
                    {/* Header */}
                    <div className="w-full flex flex-col gap-2 py-6 md:p-6">
                        <h1 className="text-center font-bold text-3xl">
                            Login
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Enter your email below to login your account.
                        </p>
                    </div>

                    {/* Form */}
                    <LoginForm />
                </div>
            </div>

            {/* photo card */}
            <div className="hidden md:block w-1/2 bg-gradient-to-b from-primary to-secondary">

            </div>
        </div>
    )
}

export default Login