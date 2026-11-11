import { isAxiosError } from "axios";

/** Turns a failed sign-in or sign-up request into a sentence that says what to do next. */
export const authErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
        if (!error.response) return "We couldn't reach FocusFlow. Check your connection and try again.";
        if (error.response.status === 401) return "That username and password don't match. Check them and try again.";
        const message = error.response.data?.message;
        if (typeof message === "string" && message) return message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};
