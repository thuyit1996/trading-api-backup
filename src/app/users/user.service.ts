import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    const user = (await this.userModel.findById(id).exec()) as any;
    if (user) {
      const { password, ...userResponse } = user._doc;
      return userResponse;
    } else {
      throw new UnauthorizedException({
        error: -1,
        message: 'Không tìm thấy người dùng',
      });
    }
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async getUserDetails({ password, ...user }) {
    return {
      ...user,
    };
  }

  async create(user) {
    const newUser = new this.userModel({
      ...user,
    });
    return newUser.save();
  }
}
