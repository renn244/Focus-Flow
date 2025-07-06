import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, HelpCircle, Mail, RefreshCw, Shield, ShieldQuestion } from "lucide-react"
import { useState } from "react"
import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

type MultifactorMethods = "authenticator" | "email"

const MultiFactor = () => {
    const [selectedMethod, setSelectedMethod] = useState<MultifactorMethods>("authenticator")
    const availableMethods: MultifactorMethods[] = ["authenticator", "email"]

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link 
                        to="/login"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back                            
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Multi-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Verify your identity to complete sign in to <strong>johndoe24@example.com</strong>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Choose verification method:</Label>
                        <div className="grid gap-2">
                            {availableMethods.map((method) => (
                                <Button
                                key={method}
                                variant={selectedMethod === method ? "default" : "outline"}
                                className="justify-start h-auto p-3"
                                onClick={() => setSelectedMethod(method)}
                                >
                                    <div className="flex items-center gap-3">
                                        <MethodIcon method={method} />
                                        <div className="text-left">
                                            <div className="font-medium"><MethodLabel method={method} /></div>
                                            <div className="text-xs text-muted-foreground"><MethodDescription method={method} /></div>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4 flex flex-col items-center">
                        <div className="text-center">
                            <Label className="text-sm font-medium justify-center">
                                Enter verification code
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                <MethodDescription method={selectedMethod} />
                            </p>
                        </div>

                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        <Button
                        type="submit"
                        className="w-full"
                        >
                            Verify Code
                        </Button>

                        {selectedMethod === "email" && (
                            <Button
                            variant="outline"
                            size="sm"
                            className="text-sm w-full"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Resend Code
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertDescription className="text-primary">
                                <span className="font-bold">Having trouble?</span> 
                                Make sure your device's time is correct and try refreshing your authenticator app.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center">
                            <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                <HelpCircle className="h-3 w-3" />
                                Lost access to your 2FA device?
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const MethodIcon = ({ method } : { method: MultifactorMethods }) => {
    switch (method) {
        case "authenticator":
            return <Shield className="h-4 w-4" />
        case "email":
            return <Mail className="h-4 w-4" />
        default:
            return <ShieldQuestion className="h-4 w-4" />
    
    }
}

const MethodLabel = ({ method } : { method: MultifactorMethods }) => {
    switch (method) {
        case "authenticator":
            return "Authenticator App";
        case "email":
            return "Email Verification";
        default:
            return "Unknown Method";
    } 
}

const MethodDescription = ({ method } : { method: MultifactorMethods }) => {
    switch (method) {
        case "authenticator":
            return "Enter the 6-digit code from your authenticator app";
        case "email":
            return "Enter the verification code sent to your email";
        default:
            return "Unknown Method Description";
    }
}

export default MultiFactor