import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class PasswordToken {
    @Prop({ required: true, unique: true })
    email: string;


    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ required: true, default: () => new Date(Date.now() + 3600000) }) // 1 hour expiration
    expiresAt: Date;
}

export const passwordTokenSchema = SchemaFactory.createForClass(PasswordToken);
export type PasswordTokenDocument = HydratedDocument<PasswordToken>;

passwordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically remove expired tokens