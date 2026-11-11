
export type User = {
    _id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    displayName: string;
    avatarUrl?: string;
    isOauthUser: boolean;
    OauthId?: string;
    /** Two-step sign-in with an authenticator app is on. */
    mfaEnabled?: boolean;
}