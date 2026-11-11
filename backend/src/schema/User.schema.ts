import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { REGEX } from "src/lib/constants/REGEX";

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ 
        required: true, unique: true,
        validate: {
            validator: (email: string) => REGEX.email.test(email),
            message: 'Invalid email format'
        }
    })
    email: string;

    @Prop({ requried: false, default: false })
    emailVerified?: boolean;

    @Prop({ required: true })
    displayName: string;

    @Prop()
    avatarUrl?: string;

    @Prop()
    password?: string;

    @Prop({ default: false })
    isOauthUser?: boolean;

    @Prop({ type: [Types.ObjectId], ref: 'TeamMember', default: [] })
    projects: Types.ObjectId[];

    @Prop()
    OauthId?: string

    /** Two-step sign-in with an authenticator app (password logins only). */
    @Prop({ default: false })
    mfaEnabled?: boolean;

    /** Authenticator secret; never returned by default queries. */
    @Prop({ select: false })
    mfaSecret?: string;

    /** Secret shown during setup, kept until the first code confirms it. */
    @Prop({ select: false })
    mfaPendingSecret?: string;
}

export const userSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;