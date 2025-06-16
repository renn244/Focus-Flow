import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    displayName: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ required: true })
    password: string;
}

export const userSchema = SchemaFactory.createForClass(User);