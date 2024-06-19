import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MESSAGES } from '../../utils/message';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { CreateUserDto } from '../../dto/user.dto';
import { Model } from 'mongoose';
import { Token } from '../../schemas/token';
import { InjectModel } from '@nestjs/mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('Token') private readonly tokenModel: Model<Token>,
  ) {}
  @Get('/signin')
  async signIn(
    @Req() request: Request,
    @Body() info,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const loginResponse = await this.authService.signIn(request.query);
      if (loginResponse) {
        response.cookie('jwt', loginResponse.token, {
          httpOnly: true,
          domain: process.env.FRONTEND_DOMAIN,
        });
        await new this.tokenModel({ jwt: loginResponse.token }).save();
        return {
          message: 'Login success',
          user: loginResponse.user,
          jwt: loginResponse.token,
        };
      } else {
        return {
          error: 1,
          message: 'Thông tin đăng nhập không chính xác',
        };
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('/signup')
  async signUp(@Req() request: Request) {
    try {
      const userResponse = (await this.authService.signUp(
        request.query,
      )) as any;
      return userResponse;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('/logout')
  async logout(@Req() request: Request) {
    try {
      await this.authService.logout(request.query?.token as string);
      return {
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/detail')
  async getUserByToken(@Req() request: Request) {
    try {
      const response = await this.authService.findByToken(
        request.query?.token as string,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('/oauth/register')
  async oAuthRegister(@Req() request: Request) {
    try {
      const { token, ...rest } = request.query;
      const response = await this.authService.registerOauth(rest);
      await new this.tokenModel({ jwt: token }).save();
      return {
        user: response,
      };
    } catch (error) {
      throw error;
    }
  }
}
