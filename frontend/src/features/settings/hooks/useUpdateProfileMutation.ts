import { handleNestError, ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { User } from "@/types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export type UpdateProfileInput = Pick<User, "displayName" | "username">;

const setCurrentUser = (
  queryClient: ReturnType<typeof useQueryClient>,
  user: User,
) => {
  queryClient.setQueryData(["user"], user);
};

export const useUpdateProfileMutation = <T extends FieldValues>(
  setError: UseFormSetError<T>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await axiosInstance.patch<User>("/user/profile", data);

      if (response.status >= 400) {
        throw new ValidationError(response.data as unknown as ExceptionResponse);
      }

      return response.data;
    },
    onSuccess: (user) => {
      setCurrentUser(queryClient, user);
      toast.success("Profile updated");
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        handleNestError(error.response, setError);
        return;
      }

      toast.error("We could not update your profile. Please try again.");
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post<User>(
        "/user/profile/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: (user) => {
      setCurrentUser(queryClient, user);
      toast.success("Profile photo updated");
    },
    onError: () =>
      toast.error(
        "We could not upload that photo. Use a JPG, PNG, or WebP under 2 MB.",
      ),
  });
};
