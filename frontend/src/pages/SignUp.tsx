import SignUpForm from "@/features/auth/components/SignUpForm"

const SignUp = () => {
    return (
        <div className="flex h-screen w-full">
            {/* photo card */}
            <div className="hidden md:block w-1/2 bg-gradient-to-b from-primary to-secondary">

            </div>

            {/* sign-up card */}
            <div className="flex w-full md:w-1/2 items-center justify-center">
                <div className="flex flex-col w-full max-w-[336px] sm:max-w-[472px] max-h-[704px] md:p-6">
                    {/* Header */}
                    <div className="w-full flex flex-col gap-2 py-6 md:p-6">
                        <h1 className="text-center font-bold text-3xl">
                            SignUp
                        </h1>
                        <p className="text-center text-muted-foreground ">
                            Enter your details to create an account.
                        </p>
                    </div>

                    {/* Form */}
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}

export default SignUp