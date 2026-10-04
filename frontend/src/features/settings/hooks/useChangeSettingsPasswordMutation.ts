import { handleNestError, ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation } from "@tanstack/react-query";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export type ChangeSettingsPasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const useChangeSettingsPasswordMutation = <T extends FieldValues>(
  setError: UseFormSetError<T>,
) =>
  useMutation({
    mutationFn: async (data: ChangeSettingsPasswordInput) => {
      const response = await axiosInstance.patch<{ message: string }>(
        "/user/profile/password",
        data,
      );

      if (response.status >= 400) {
        throw new ValidationError(response.data as unknown as ExceptionResponse);
      }

      return response.data;
    },
    onSuccess: (data) => toast.success(data.message),
    onError: (error) => {
      if (error instanceof ValidationError) {
        handleNestError(error.response, setError);
        return;
      }

      toast.error("We could not change your password. Please try again.");
    },
  });
