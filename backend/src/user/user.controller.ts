import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  Patch,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { plainToInstance } from 'class-transformer';
import { MAX_AVATAR_SIZE_BYTES } from './avatar.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const avatarUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES, files: 1 },
});

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.findById(id.toString());
  }

  @ApiOperation({ summary: 'Update the signed-in user profile' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @Patch('profile')
  async updateProfile(@User() user: UserJwt, @Body() body: UpdateProfileDto) {
    const updatedUser = await this.userService.updateProfile(user.id, body);
    return plainToInstance(ProfileResponseDto, updatedUser.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Change the signed-in user password' })
  @Patch('profile/password')
  async changePassword(@User() user: UserJwt, @Body() body: ChangePasswordDto) {
    await this.userService.changePassword(user.id, body);
    return { message: 'Password changed successfully' };
  }

  @ApiOperation({ summary: 'Upload an avatar for the signed-in user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: ProfileResponseDto })
  @UseInterceptors(avatarUpload)
  @Post('profile/avatar')
  async uploadAvatar(
    @User() user: UserJwt,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req()
    request: { protocol: string; get: (header: string) => string | undefined },
  ) {
    const host = request.get('host');
    const publicOrigin =
      process.env.PUBLIC_API_ORIGIN || `${request.protocol}://${host}`;
    const updatedUser = await this.userService.updateAvatar(
      user.id,
      file,
      publicOrigin,
    );
    return plainToInstance(ProfileResponseDto, updatedUser.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Delete()
  async deleteUser() {}
}
