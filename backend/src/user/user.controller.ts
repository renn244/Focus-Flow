import { Controller, Get, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get(':id')
  async getUserById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.findById(id.toString());
  }

  @Patch()
  async updateUser() {

  }

  @Delete()
  async deleteUser() {

  }
}
