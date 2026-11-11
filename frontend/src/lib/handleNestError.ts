import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export class ValidationError extends Error {
    response: ExceptionResponse;
    constructor(response: ExceptionResponse) {
        super(response.message || "Validation failed");
        this.response = response;
    }
}

export function handleNestError<T extends FieldValues>(
    error: ExceptionResponse,
    setError: UseFormSetError<T>,
) {
    if(error?.errors) {
        const fieldErrors = error.errors;
        for (const field in fieldErrors) {
            setError(field as Path<T>, {
                type: "manual",
                message: fieldErrors[field].message || "Invalid input",
            })
        }
    } else if(error.message) {
        toast.error(error.message, {
            description: "Please follow the instructions to correct the errors.",
        })
    }
}