import { Controller, Get, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.userService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
  }
}
