import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { TEAM_MEMBER_ROLES_ARRAY } from "src/team/constant/role";

@Schema()
export class TeamMember {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ type: String, enum: TEAM_MEMBER_ROLES_ARRAY, required: true }) // will be useful later on for permissions
    role: string; // e.g., "owner", "admin", "member", etc.

    @Prop({ default: Date.now })
    joinedAt: Date;
}

export const teamMemberSchema = SchemaFactory.createForClass(TeamMember);
export type TeamMemberDocument = HydratedDocument<TeamMember>;