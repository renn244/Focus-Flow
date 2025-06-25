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
              <Link className='text-sm underline underline-offset-2' to='/forgotpassword'>Forgot your password?</Link>
            </div>
            <FormControl>
              <PasswordInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />

        <Button className="block w-full" variant="default" type="submit">
          {isPending ? <LoadingSpinner /> : "Login"}
        </Button>

        <Button onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/login`}
        className="block w-full" variant="outline" type="button">
          Login with Github
        </Button>

        <div className="pt-4">
          <p className='text-sm text-center'>
            Don't have an account? {" "}
            <Link className='underline underline-offset-2' to="/sign-up">Sign Up</Link>
          </p>
        </div>
      </form>
    </Form>
  )
}

export default LoginForm