import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TradingModule } from './app/trading/trading.module';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { ChatModule } from './app/chat/chat.module';
import { PostModule } from './app/post/post.module';
const getEnvironment = () => {
  if (!process.env.NODE_ENV) {
    return '';
  }
  return `.${process.env.NODE_ENV}`;
};
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${getEnvironment()}`,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    TradingModule,
    AuthModule,
    UsersModule,
    ChatModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
