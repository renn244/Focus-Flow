import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/User.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: User) {
    const newUser = new this.userModel(createUserDto);
    await newUser.save()

    return newUser;
  }

  async findById(id: Types.ObjectId, options?: { 
    optional?: boolean, message?: string, select: string | Record<string, 0 | 1>
  }) {
    const user = await this.userModel.findById(id).select(options?.select || '');

    if(!user && !options?.optional) {
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
    const user = await this.userModel.findOne({ $or: [ { username }, { email } ] })

    return user || null;
  }

  async update(id: Types.ObjectId, updateUserDto: Partial<UserDocument>) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });

    if(!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePasswordByEmail(email: string, newPassword: string) {
    const user = await this.userModel.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
    return user
  }
}
