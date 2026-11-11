import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useAuthContext } from "@/context/authContext";
import { cn } from "@/lib/utils";
import FormAlert from "@/features/auth/components/FormAlert";
import { mfaApi, mfaErrorMessage, mfaTicket, type MfaMethod } from "@/features/auth/mfa";

const methods: { id: MfaMethod; label: string; icon: typeof Smartphone }[] = [
    { id: "authenticator", label: "Authenticator app", icon: Smartphone },
    { id: "email", label: "Email code", icon: Mail },
];

/** The second step of a password login for accounts with two-step sign-in on. */
const MultiFactor = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuthContext();
    const [challenge] = useState(mfaTicket.read);
    const [method, setMethod] = useState<MfaMethod>("authenticator");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [verifying, setVerifying] = useState(false);
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timer = useRef<number>(undefined);

    useEffect(() => () => window.clearInterval(timer.current), []);

    const startCooldown = (seconds: number) => {
        setCooldown(seconds);
        window.clearInterval(timer.current);
        timer.current = window.setInterval(() => {
            setCooldown((left) => {
                if (left <= 1) window.clearInterval(timer.current);
                return Math.max(0, left - 1);
            });
        }, 1000);
    };

    if (!challenge) {
        return (
            <AuthLayout>
                <Card className="w-full max-w-md">
                    <CardHeader className="px-6 sm:px-8">
                        <CardTitle className="text-2xl font-semibold text-foreground">Sign in again</CardTitle>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This step only works right after you enter your password, and it expires after a few minutes.
                        </p>
                    </CardHeader>
                    <CardContent className="px-6 sm:px-8">
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                            <Link to="/login">Back to sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    const verify = async (value = code) => {
        if (value.length !== 6 || verifying) return;
        setVerifying(true);
        setError(undefined);
        try {
            const { access_token, refresh_token } = await mfaApi.verify(challenge.mfaToken, value, method);
            localStorage.setItem("access_token", access_token);
            if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
            mfaTicket.clear();
            await checkAuth();
            await navigate({ to: "/projects" });
        } catch (failure) {
            const message = mfaErrorMessage(failure, "That code didn't work. Try again.");
            setError(message);
            setCode("");
            // An expired or used-up ticket can't recover; send them back to the password step.
            if (/sign in again|expired|already used/i.test(message)) mfaTicket.clear();
        } finally {
            setVerifying(false);
        }
    };

    const sendEmail = async () => {
        setSending(true);
        setError(undefined);
        try {
            const result = await mfaApi.sendEmail(challenge.mfaToken);
            setNotice(result.message);
            startCooldown(result.cooldownSeconds);
        } catch (failure) {
            setError(mfaErrorMessage(failure, "We couldn't send the email. Try again."));
        } finally {
            setSending(false);
        }
    };

    const switchMethod = (next: MfaMethod) => {
        setMethod(next);
        setCode("");
        setError(undefined);
    };

    return (
        <AuthLayout>
            <Card className="w-full max-w-md gap-2 bg-card py-8">
                <CardHeader className="gap-0 px-6 pb-6 sm:px-8">
                    <Link
                        to="/login"
                        onClick={() => mfaTicket.clear()}
                        className="mb-4 inline-flex w-fit items-center gap-1 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2"
                    >
                        <ArrowLeft className="size-4" /> Back to sign in
                    </Link>
                    <CardTitle className="text-2xl font-semibold text-foreground">Two-step sign-in</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {method === "authenticator"
                            ? "Enter the 6-digit code from your authenticator app."
                            : `We'll email a code to ${challenge.email}.`}
                    </p>
                </CardHeader>

                <CardContent className="space-y-5 px-6 sm:px-8">
                    <div role="group" aria-label="How to get your code" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                        {methods.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={method === id}
                                onClick={() => switchMethod(id)}
                                className={cn(
                                    "flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-2",
                                    method === id ? "bg-card text-foreground shadow-[0_1px_2px_rgb(15_23_42/0.1)]" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="size-4" aria-hidden="true" /> {label}
                            </button>
                        ))}
                    </div>

                    {method === "email" && (
                        <Button type="button" variant="outline" className="w-full" onClick={sendEmail} disabled={sending || cooldown > 0}>
                            {sending ? <><LoadingSpinner className="size-4" /> Sending…</> : cooldown > 0 ? `Send again in ${cooldown}s` : notice ? "Send a new code" : "Email me a code"}
                        </Button>
                    )}
                    {method === "email" && notice && <p className="text-sm text-muted-foreground" role="status">{notice}</p>}

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void verify();
                        }}
                        className="space-y-5"
                    >
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={code}
                                onChange={setCode}
                                onComplete={(value: string) => void verify(value)}
                                autoFocus
                                aria-label="6-digit code"
                                disabled={verifying}
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }, (_, index) => (
                                        <InputOTPSlot key={index} index={index} className="size-11 text-lg sm:size-12" />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <FormAlert message={error} />

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={code.length !== 6 || verifying}>
                            {verifying ? <><LoadingSpinner className="size-4" /> Checking…</> : "Verify and sign in"}
                        </Button>
                    </form>

                    {method === "authenticator" && (
                        <p className="text-center text-sm text-muted-foreground">
                            Phone not with you?{" "}
                            <button type="button" onClick={() => switchMethod("email")} className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-600">
                                Get a code by email
                            </button>
                        </p>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
};

export default MultiFactor;
