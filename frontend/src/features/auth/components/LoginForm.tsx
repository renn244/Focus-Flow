import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import zod from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { loginSchema } from '../type';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/ui/passwordInput';
import { Link } from "@tanstack/react-router";
import LoadingSpinner from '@/components/ui/loadingSpinner';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Github } from 'lucide-react';

export const loginFormSchema = zod.object({
  username: zod.string().min(3, { message: 'Username is required' }),
  password: zod.string().min(3, { message: 'Password is required' })
})

const LoginForm = () => {

  const form = useForm<loginSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: '', password: '' }
  })
  const { mutate, isPending } = useLoginMutation<loginSchema>(form.setError);

  const onSubmit = async (data: loginSchema) => {
    try {
      mutate(data);
    } catch (error) {
      toast.error("An error occurred during login");
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 gap-2">
      <CardHeader className="space-y-1 pb-6 gap-0">
        <CardTitle className='text-2xl font-bold text-center text-gray-900'>Welcome Back</CardTitle>
        <p className="text-center text-gray-600">Enter your credentials to access your account</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
            control={form.control}
            name="username"
            render={({ field}) => (
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Password</FormLabel>
                  <Link className='text-sm underline underline-offset-2 text-blue-700' to='/forgotpassword'>Forgot your password?</Link>
                </div>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />

            <Button className="w-full bg-blue-600 hover:bg-blue-700" variant="default" type="submit">
              {isPending ?(
                 <LoadingSpinner />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
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
            className="w-full" variant="outline" type="button">
              <>
                <Github className="w-4 h-4 mr-1" />
                Continue with GitHub
              </>
            </Button>

            <div className="pt-4">
              <p className='text-sm text-center'>
                Don't have an account? {" "}
                <Link className='underline underline-offset-2 text-blue-700' to="/sign-up">Sign Up</Link>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LoginForm