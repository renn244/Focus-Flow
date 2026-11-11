import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useAuthContext } from "@/context/authContext";
import FormAlert from "@/features/auth/components/FormAlert";
import { mfaApi, mfaErrorMessage } from "@/features/auth/mfa";

type Step = "idle" | "scan" | "disable";

/** Turn two-step sign-in on (scan a QR code, confirm one code) or off (confirm the password). */
const TwoStepSignIn = ({ enabled }: { enabled: boolean }) => {
    const { checkAuth } = useAuthContext();
    const [step, setStep] = useState<Step>("idle");
    const [setup, setSetup] = useState<{ qrDataUrl: string; secret: string }>();
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);

    const reset = () => {
        setStep("idle");
        setSetup(undefined);
        setCode("");
        setPassword("");
        setError(undefined);
    };

    const run = async (action: () => Promise<void>, fallback: string) => {
        setBusy(true);
        setError(undefined);
        try {
            await action();
        } catch (failure) {
            setError(mfaErrorMessage(failure, fallback));
        } finally {
            setBusy(false);
        }
    };

    const begin = () => run(async () => {
        setSetup(await mfaApi.setup());
        setStep("scan");
    }, "Setup couldn't start. Try again.");

    const confirm = (value = code) => {
        if (value.length !== 6) return;
        return run(async () => {
            await mfaApi.enable(value);
            await checkAuth();
            toast.success("Two-step sign-in is on");
            reset();
        }, "That code didn't work. Try the newest code from your app.");
    };

    const turnOff = () => run(async () => {
        await mfaApi.disable(password);
        await checkAuth();
        toast.success("Two-step sign-in is off");
        reset();
    }, "Couldn't turn it off. Try again.");

    if (step === "scan" && setup) {
        return (
            <div className="mt-5 space-y-5">
                <ol className="space-y-5 text-sm">
                    <li>
                        <p className="font-medium text-foreground">1. Scan this QR code with an authenticator app</p>
                        <p className="mt-1 text-muted-foreground">Google Authenticator, Microsoft Authenticator, Authy or 1Password all work.</p>
                        <div className="mt-3 flex flex-wrap items-start gap-4">
                            <img src={setup.qrDataUrl} alt="QR code for your authenticator app" width={176} height={176} className="rounded-lg border bg-white p-2" />
                            <div className="min-w-0 max-w-xs text-xs text-muted-foreground">
                                <p>Can't scan? Enter this key in the app instead:</p>
                                <code className="mt-1 block break-all rounded-md bg-muted px-2 py-1.5 font-mono text-[13px] tracking-wider text-foreground">{setup.secret}</code>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p className="font-medium text-foreground">2. Enter the 6-digit code the app shows</p>
                        <div className="mt-3">
                            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={setCode} onComplete={(value: string) => void confirm(value)} aria-label="6-digit code" disabled={busy}>
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </li>
                </ol>
                <FormAlert message={error} />
                <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => void confirm()} disabled={code.length !== 6 || busy}>
                        {busy ? <><LoadingSpinner className="size-4" /> Turning on…</> : "Turn on"}
                    </Button>
                    <Button type="button" variant="outline" onClick={reset} disabled={busy}>Cancel</Button>
                </div>
            </div>
        );
    }

    if (step === "disable") {
        return (
            <form className="mt-5 max-w-sm space-y-3" onSubmit={(event) => { event.preventDefault(); void turnOff(); }}>
                <div className="space-y-2">
                    <Label htmlFor="mfa-password">Confirm your password to turn it off</Label>
                    <Input id="mfa-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
                </div>
                <FormAlert message={error} />
                <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="destructive" disabled={!password || busy}>
                        {busy ? <><LoadingSpinner className="size-4" /> Turning off…</> : "Turn off"}
                    </Button>
                    <Button type="button" variant="outline" onClick={reset} disabled={busy}>Cancel</Button>
                </div>
            </form>
        );
    }

    return (
        <div className="mt-5 space-y-4">
            <p className="flex items-start gap-2 text-sm">
                {enabled ? (
                    <><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /><span className="text-muted-foreground">On. Signing in asks for a code from your authenticator app, or one sent to your email.</span></>
                ) : (
                    <><ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span className="text-muted-foreground">Off. Turn it on so a stolen password alone can't get into your account.</span></>
                )}
            </p>
            <FormAlert message={error} />
            {enabled ? (
                <Button type="button" variant="outline" onClick={() => setStep("disable")}>Turn off</Button>
            ) : (
                <Button type="button" onClick={() => void begin()} disabled={busy}>
                    {busy ? <><LoadingSpinner className="size-4" /> Starting…</> : "Set up two-step sign-in"}
                </Button>
            )}
        </div>
    );
};

export default TwoStepSignIn;
