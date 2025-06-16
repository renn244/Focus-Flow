import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import zod from 'zod';
import type { signUpSchema } from '../type';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/ui/passwordInput';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export const signUpFormSchema = zod.object({
    username: zod.string(),
    email: zod.string().email(),
    password: zod.string(),
    confirmPassword: zod.string()
})

const SignUpForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<signUpSchema>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
    })

    const onSubmit = async (data: signUpSchema) => {

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
                    SignUp
                </Button>

                <Button className='block w-full' variant="outline" type="button">
                    SignUp with Google
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