
export type User = {
    _id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    displayName: string;
    avatarUrl?: string;
    isOauthUser: boolean;
    OauthId?: string;
}