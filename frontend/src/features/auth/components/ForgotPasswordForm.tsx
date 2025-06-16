import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod"
import type { forgotPasswordSchema } from "../type";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const forgotPasswordFormSchema = z.object({
    email: z.string().email()
})

const ForgotPasswordForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<forgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: { email: '' }
    })

    const onSubmit = async (data: forgotPasswordSchema) => {

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField 
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" placeholder="johndoe24@example.com" className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <Button className="block w-full"  type="submit">
                    Send reset link
                </Button>
            </form>
        </Form>
    )
}

export default ForgotPasswordForm