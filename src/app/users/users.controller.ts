import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from '../../schemas/user';
import { UserService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/detail/:id')
  async getUserById(@Param('id') id) {
    try {
      const response = await this.userService.findById(id);
      return {
        ...response,
      };
    } catch (error) {
      throw error;
    }
  }
}
