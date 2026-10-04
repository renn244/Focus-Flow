import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { CACHE_KEYS } from 'src/lib/constants/CACHE_KEYS';
import { User, UserDocument } from 'src/schema/User.schema';
import { AvatarStorageService } from './avatar-storage.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ValidationException } from 'src/lib/Exception/ValidationException';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly avatarStorage: AvatarStorageService,
  ) {}

  async create(createUserDto: Omit<User, 'projects'>) {
    const newUser = new this.userModel(createUserDto);
    await newUser.save();

    return newUser;
  }

  async findById(
    id: string,
    options?: {
      optional?: boolean;
      message?: string;
      select: string | Record<string, 0 | 1>;
    },
  ) {
    const user = await this.userModel
      .findById(id)
      .select(options?.select || '');

    if (!user && !options?.optional) {
      throw new NotFoundException(options?.message || 'User not found');
    }

    return user;
  }

  async findByOauthId(OauthId: string) {
    const user = await this.userModel.findOne({ OauthId: OauthId });

    return user || null;
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username });

    return user || null;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    return user || null;
  }

  async findByUsernameOrEmail(username: string, email: string) {
    const user = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    return user || null;
  }

  async findManyByUsernameOrEmail(query: string) {
    const users = await this.userModel.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

    return users || [];
  }

  async update(id: Types.ObjectId, updateUserDto: Partial<UserDocument>) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto.username) {
      const existingUser = await this.userModel.exists({
        _id: { $ne: id },
        username: updateProfileDto.username,
      });

      if (existingUser) {
        throw new ValidationException({
          username: { message: 'That username is already in use' },
        });
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, {
        new: true,
        runValidators: true,
      })
      .select('-password');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    await this.invalidateUserAuthCache(id);
    return updatedUser;
  }

  async updateAvatar(
    id: string,
    file: Express.Multer.File,
    publicOrigin: string,
  ) {
    const currentUser = await this.userModel.findById(id).select('avatarUrl');

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const storedAvatar = await this.avatarStorage.store(file);
    const avatarUrl = `${publicOrigin}/uploads/avatars/${storedAvatar.filename}`;

    let updatedUser: UserDocument | null;
    try {
      updatedUser = await this.userModel
        .findByIdAndUpdate(
          id,
          { avatarUrl },
          { new: true, runValidators: true },
        )
        .select('-password');
    } catch (error) {
      await this.avatarStorage.remove(storedAvatar.filename);
      throw error;
    }

    if (!updatedUser) {
      await this.avatarStorage.remove(storedAvatar.filename);
      throw new NotFoundException('User not found');
    }

    await this.invalidateUserAuthCache(id);
    await this.avatarStorage.removeByUrl(currentUser.avatarUrl);
    return updatedUser;
  }

  async changePassword(id: string, body: ChangePasswordDto) {
    const user = await this.userModel
      .findById(id)
      .select('password isOauthUser');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isOauthUser || !user.password) {
      throw new ValidationException({
        currentPassword: {
          message: 'Password changes are managed by your sign-in provider',
        },
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      body.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new ValidationException({
        currentPassword: { message: 'Current password is incorrect' },
      });
    }

    if (body.currentPassword === body.newPassword) {
      throw new ValidationException({
        newPassword: {
          message: 'New password must be different from your current password',
        },
      });
    }

    user.password = await bcrypt.hash(body.newPassword, 10);
    await user.save();
    await this.invalidateUserAuthCache(id);
  }

  private async invalidateUserAuthCache(userId: string) {
    await this.cacheManager.del(CACHE_KEYS.userAuth(userId));
  }

  async updatePasswordByEmail(email: string, newPassword: string) {
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true },
    );
    return user;
  }

  async addProjectToUser(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { projects: projectId } },
      { new: true, session },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async removeProjectFromUser(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { projects: projectId } },
      { new: true, session },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
