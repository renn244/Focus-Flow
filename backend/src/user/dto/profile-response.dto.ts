import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({ example: '66abb79d7cb29fec9b2f98938' })
  @Expose()
  _id: string;

  @ApiProperty({ example: 'focusflow-qa' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'FocusFlow QA' })
  @Expose()
  displayName: string;

  @ApiProperty({ example: 'focusflow-qa@focusflow.local' })
  @Expose()
  email: string;

  @ApiProperty({ example: true })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({ example: false, description: 'Whether two-step sign-in is turned on.' })
  @Expose()
  mfaEnabled: boolean;

  @ApiPropertyOptional({
    example: 'http://localhost:5000/uploads/avatars/avatar.png',
  })
  @Expose()
  avatarUrl?: string;

  @ApiProperty({ example: false })
  @Expose()
  isOauthUser: boolean;
}
