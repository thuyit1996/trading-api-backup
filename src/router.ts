import { Routes } from 'nest-router';
import { AppModule } from './app.module';
import { AuthModule } from './app/auth/auth.module';
import { TradingModule } from './app/trading/trading.module';
import { UsersModule } from './app/users/users.module';

const routes: Routes = [
  {
    path: '/api',
    module: AppModule,
    children: [
      {
        path: '/trading',
        module: TradingModule,
      },
      {
        path: '/auth',
        module: AuthModule,
      },
      {
        path: '/user',
        module: UsersModule,
      },
    ],
  },
];

export default routes;
