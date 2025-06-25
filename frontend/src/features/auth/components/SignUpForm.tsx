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

                <Button className='block w-full' variant="default" type="submit">
                    {isPending ? <LoadingSpinner /> : "SignUp"}
                </Button>

                <Button onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/login`} 
                className='block w-full' variant="outline" type="button">
                    SignUp with Github
                </Button>

                <div className="pt-4">
                    <p className='text-sm text-center'>
                        Already have an account? {" "}
                        <Link className='underline underline-offset-2' to="/login">Login</Link>
                    </p>
                </div>
            </form>
        </Form>
    )
}

export default SignUpForm