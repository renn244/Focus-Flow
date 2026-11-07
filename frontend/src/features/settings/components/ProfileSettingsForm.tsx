import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateProfileMutation } from "@/features/settings/hooks/useUpdateProfileMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name cannot be empty")
    .max(60, "Display name must be 60 characters or fewer"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be 32 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Use letters, numbers, underscores, or hyphens only",
    ),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileSettingsFormProps = {
  displayName: string;
  username: string;
};

const ProfileSettingsForm = ({
  displayName,
  username,
}: ProfileSettingsFormProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName, username },
    mode: "onBlur",
  });
  const updateProfile = useUpdateProfileMutation(form.setError);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data, {
      onSuccess: () => form.reset(data),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-5"
      >
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input maxLength={60} autoComplete="name" {...field} />
              </FormControl>
              <FormDescription>
                Use the name teammates should recognize.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input
                    minLength={3}
                    maxLength={32}
                    autoComplete="username"
                    className="pl-9"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription>
                Letters, numbers, underscores, and hyphens only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!form.formState.isDirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Save changes
        </Button>
      </form>
    </Form>
  );
};

export default ProfileSettingsForm;
