import type { z } from "zod";
import type { TEAM_MEMBER_ROLES } from "./constants/role";
import type { addMemberFormSchema } from "./components/forms/AddMemberForm";
import type { changeRoleFormSchema } from "./components/forms/ChangeRoleForm";

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

export type TeamMemberTableSortField = 'member' | 'role' | 'email' | 'joined';
export type TeamMemberTableSortOrder = 'asc' | 'desc';

export type TeamMembersPage = {
    items: TeamMemberWithUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type AddMemberSchema = z.infer<typeof addMemberFormSchema>;
export type ChangeRoleSchema = z.infer<typeof changeRoleFormSchema>;
