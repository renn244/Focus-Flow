import { isAxiosError } from "axios";
import axiosInstance from "@/lib/httpService";

export type MfaMethod = "authenticator" | "email";

/** What a password login returns when the account has two-step sign-in on. */
export type MfaChallenge = { mfaRequired: true; mfaToken: string; email: string; methods: MfaMethod[] };

const KEY = "mfa_ticket";

/**
 * The short-lived ticket lives in sessionStorage (not the URL), so it isn't
 * left in browser history and disappears with the tab.
 */
export const mfaTicket = {
    save: (challenge: MfaChallenge) => sessionStorage.setItem(KEY, JSON.stringify(challenge)),
    read: (): MfaChallenge | null => {
        try {
            const raw = sessionStorage.getItem(KEY);
            return raw ? (JSON.parse(raw) as MfaChallenge) : null;
        } catch {
            return null;
        }
    },
    clear: () => sessionStorage.removeItem(KEY),
};

/** The server's own sentence for a failed request, or a plain fallback. */
export const mfaErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
        if (!error.response) return "We couldn't reach FocusFlow. Check your connection and try again.";
        const message = error.response.data?.message;
        if (typeof message === "string" && message) return message;
        if (Array.isArray(message) && message.length) return String(message[0]);
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

/** Axios here resolves 4xx (except 401) instead of throwing; turn those into errors. */
const post = async <T,>(url: string, body?: unknown): Promise<T> => {
    const response = await axiosInstance.post(url, body);
    if (response.status >= 400) {
        const message = response.data?.errors ? Object.values(response.data.errors as Record<string, { message: string }>)[0]?.message : response.data?.message;
        throw new Error(message || "Something went wrong. Try again.");
    }
    return response.data as T;
};

export const mfaApi = {
    verify: (mfaToken: string, code: string, method: MfaMethod) =>
        post<{ access_token: string; refresh_token?: string }>("/auth/mfa/verify", { mfaToken, code, method }),
    sendEmail: (mfaToken: string) => post<{ message: string; cooldownSeconds: number }>("/auth/mfa/email", { mfaToken }),
    setup: () => post<{ qrDataUrl: string; secret: string }>("/auth/mfa/setup"),
    enable: (code: string) => post<{ mfaEnabled: boolean }>("/auth/mfa/enable", { code }),
    disable: (password: string) => post<{ mfaEnabled: boolean }>("/auth/mfa/disable", { password }),
};
