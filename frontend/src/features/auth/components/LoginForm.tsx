import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import zod from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { loginSchema } from '../type';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/ui/passwordInput';
import { Link } from "@tanstack/react-router";
import { useState } from 'react';

export const loginFormSchema = zod.object({
  username: zod.string(),
  password: zod.string()
})

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<loginSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: '', password: '' }
  })

  const onSubmit = async (data: loginSchema) => {
  
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
              <Link className='text-sm underline underline-offset-2' to='/'>Forgot your password?</Link>
            </div>
            <FormControl>
              <PasswordInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />

        <Button className="block w-full" variant="default" type="submit">
          Login
        </Button>

        <Button className="block w-full" variant="outline" type="button">
          Login with Google
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