
const TEAM_MEMBER_ROLES = {
    MEMBER: 'member', 
    ADMIN: 'admin', 
    OWNER: 'owner'
} as const;
const TEAM_MEMBER_ROLES_ARRAY = Object.values(TEAM_MEMBER_ROLES);

type KeyTeamMemberRole = keyof typeof TEAM_MEMBER_ROLES;
type TeamMemberRole = typeof TEAM_MEMBER_ROLES[KeyTeamMemberRole];

export { TEAM_MEMBER_ROLES, TEAM_MEMBER_ROLES_ARRAY, KeyTeamMemberRole, TeamMemberRole }