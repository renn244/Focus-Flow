

export class CreateForgetPasswordTokenDto {
    email: string;
    token?: string;
    expiresAt?: Date;
}