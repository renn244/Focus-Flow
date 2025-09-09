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
}

export const userSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;