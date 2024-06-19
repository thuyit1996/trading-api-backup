import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../../schemas/token';
import { UserSchema } from '../../schemas/user';
import { OauthUserSchema } from '../../schemas/oauth';
@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: 'Oauth', schema: OauthUserSchema }]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: 'secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
})
export class AuthModule { }
