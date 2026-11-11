import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import zod from 'zod';
import type { signUpSchema } from '../type';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/ui/passwordInput';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useSignUpMutation } from '../hooks/useSignUpMutation';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Github } from 'lucide-react';
import FormAlert from './FormAlert';

export const signUpFormSchema = zod.object({
    username: zod.string()
        .min(3, { message: 'Username must be at least 3 characters long' }),
    email: zod.string()
        .min(3, { message: 'Email must be at least 3 characters long' })
        .email({ message: 'Must be a valid email address' }),
    password: zod.string()
        .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: zod.string()
        .min(1, { message: 'Type your password again' })
}).superRefine(({ password, confirmPassword }, ctx) => {
    if(password !== confirmPassword) {
        ctx.addIssue({
            path: ['confirmPassword'],
            code: zod.ZodIssueCode.custom,
            message: 'Passwords do not match',
        })
    }
})

const SignUpForm = () => {
    const form = useForm<signUpSchema>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
    })
    const { mutate, isPending } = useSignUpMutation<signUpSchema>(form.setError);

    const onSubmit = (data: signUpSchema) => mutate(data);
    
    return (
        <Card className="w-full max-w-md bg-card py-8 gap-2">
            <CardHeader className="space-y-1 px-6 pb-6 gap-0 sm:px-8">
                <CardTitle className="text-2xl font-semibold text-left text-foreground">Create your account</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">It takes a minute. We'll email you a link to confirm your address.</p>
            </CardHeader>
            <CardContent className="px-6 sm:px-8">
                <Form {...form}>
                    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField 
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Choose a username" autoComplete="username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} autoComplete="new-password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} autoComplete="new-password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormAlert message={form.formState.errors.root?.server?.message} />

                        <Button className='w-full bg-blue-600 hover:bg-blue-700' variant="default" type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <LoadingSpinner className="size-4" />
                                    Creating account…
                                </>
                            ): (
                                <div className="flex items-center gap-2">
                                    Create account
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/login`} 
                        className='w-full' variant="outline" type="button">
                            <>
                                <Github className="w-4 h-4 mr-2" />
                                Continue with GitHub
                            </>
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to='/login' className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-600">
                                Log in
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SignUpForm
