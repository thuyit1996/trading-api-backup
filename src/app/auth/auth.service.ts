import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Oauth } from '../../schemas/oauth';
import { Token } from '../../schemas/token';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel('Token') private readonly tokenModel: Model<Token>,
    @InjectModel('Oauth') private readonly oAuthModel: Model<Oauth>,
  ) {}
  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  async signUp(user) {
    try {
      const existingUser = await this.userService.findByEmail(user.email);
      if (existingUser) {
        return {
          error: {
            code: -1,
            message: 'Email này đã tồn tại',
          },
        };
      }
      const hashPassword = await this.hashPassword(user.password);
      await this.userService.create({
        ...user,
        password: hashPassword,
      });
      return {
        responseData: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async doesPasswordMatch(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log('user', email);
    if (!user) {
      return null;
    }
    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) return null;
    return this.userService.getUserDetails(user?.toObject());
  }

  async signIn(info) {
    const { email, password } = info;
    const user = await this.validateUser(email, password);
    console.log(user);
    if (!user) return null;
    const jwt = await this.jwtService.signAsync({ user });
    return {
      token: jwt,
      user,
    };
  }

  async logout(token: string) {
    console.log(token);
    await this.tokenModel.deleteOne({ jwt: token });
  }

  async findByToken(token: string) {
    const exists = await this.tokenModel.findOne({ jwt: token });
    if (exists) {
      const user = this.jwtService.decode(token);
      return user;
    } else {
      throw new UnauthorizedException({
        error: -1,
        message: 'Không tìm thấy người dùng',
      });
    }
  }

  async registerOauth(info: any) {
    const exists = await this.oAuthModel.findOne({ email: info.email });
    if (exists) {
      return exists;
    } else {
      const newData = await new this.oAuthModel(info).save();
      return newData;
    }
  }
}
