import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class VerifyEmailToken {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    userId: string; // Assuming this is a reference to the user's ID

    @Prop({ required: true })
    token: string;

    @Prop({ required: true, default: () => new Date(Date.now() + 86400000) }) // 24 hour expiration
    expiresAt: Date;
}

export const verifyEmailTokenSchema = SchemaFactory.createForClass(VerifyEmailToken);
export type VerifyEmailTokenDocument = HydratedDocument<VerifyEmailToken>;

verifyEmailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired tokens