import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/schema/User.schema';
import { AvatarStorageService } from './avatar-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, AvatarStorageService],
  exports: [UserService],
})
export class UserModule {}
