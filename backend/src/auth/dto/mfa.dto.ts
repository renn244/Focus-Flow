import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsJWT, IsString, Matches, MinLength } from 'class-validator';

const SIX_DIGITS = /^\s*\d{3}\s?\d{3}\s*$/;

export class MfaCodeDto {
  @ApiProperty({
    example: '123456',
    description: 'The 6-digit code from the authenticator app.',
  })
  @IsString()
  @Matches(SIX_DIGITS, { message: 'Enter the 6-digit code.' })
  code: string;
}

export class MfaVerifyDto extends MfaCodeDto {
  @ApiProperty({
    description: 'The short-lived ticket returned by a password login.',
  })
  @IsJWT({ message: 'Your sign-in step expired. Sign in again.' })
  mfaToken: string;

  @ApiProperty({ enum: ['authenticator', 'email'] })
  @IsIn(['authenticator', 'email'])
  method: 'authenticator' | 'email';
}

export class MfaTicketDto {
  @ApiProperty({
    description: 'The short-lived ticket returned by a password login.',
  })
  @IsJWT({ message: 'Your sign-in step expired. Sign in again.' })
  mfaToken: string;
}

export class MfaDisableDto {
  @ApiProperty({
    description: 'Current password, to confirm turning two-step sign-in off.',
  })
  @IsString()
  @MinLength(1, { message: 'Enter your password.' })
  password: string;
}
