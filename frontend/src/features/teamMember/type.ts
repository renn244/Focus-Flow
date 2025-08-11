import type { TEAM_MEMBER_ROLES } from "./constants/role";

export type TeamMember = {
    _id: string;
    userId: string;
    projectId: string;
    role: typeof TEAM_MEMBER_ROLES[keyof typeof TEAM_MEMBER_ROLES];
    joinedAt: string;
}

export type TeamMemberUser = {
    _id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
}

export type TeamMemberWithUser = Omit<TeamMember, 'userId'> & {
    user: TeamMemberUser;
}