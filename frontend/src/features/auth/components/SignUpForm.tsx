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
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Github } from 'lucide-react';

export const signUpFormSchema = zod.object({
    username: zod.string()
        .min(3, { message: 'Username must be at least 3 characters long' }),
    email: zod.string()
        .min(3, { message: 'Email must be at least 3 characters long' })
        .email({ message: 'Must be a valid email address' }),
    password: zod.string()
        .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: zod.string()
        .min(8, { message: 'Confirm Password must be at least 8 characters long' })
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

    const onSubmit = async (data: signUpSchema) => {
        try {
            mutate(data)
        } catch (error) {
            toast.error("An error occurred during sign up");
        }
    }
    
    return (
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 gap-2">
            <CardHeader className="space-y-1 pb-6 gap-0">
                <CardTitle className="text-2xl font-bold text-center text-gray-900">Create your account</CardTitle>
                <p className="text-center text-gray-600">Enter your details to get started</p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField 
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="johndoe24" {...field} />
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
                                    <Input placeholder="johndoe24@example.com" {...field} />
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
                                    <PasswordInput {...field} />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Button className='w-full bg-blue-600 hover:bg-blue-700' variant="default" type="submit">
                            {isPending ? (
                                <LoadingSpinner /> 
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
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <Button onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/login`} 
                        className='w-full' variant="outline" type="button">
                            <>
                                <Github className="w-4 h-4 mr-2" />
                                Continue with GitHub
                            </>
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link to='/login' className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium">
                                Login
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SignUpForm