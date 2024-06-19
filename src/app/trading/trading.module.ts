import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceSchema } from '../../schemas/price';
import { BuySchema } from '../../schemas/buy';
import { VnIndexSchema } from '../../schemas/vnindex';
import { HistorySchema } from '../../schemas/history';
import { BuyHistorySchema } from '../../schemas/buy-sell-history';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Price', schema: PriceSchema }]),
    MongooseModule.forFeature([{ name: 'Buy', schema: BuySchema }]),
    MongooseModule.forFeature([{ name: 'History', schema: HistorySchema }]),
    MongooseModule.forFeature([
      { name: 'BuyHistory', schema: BuyHistorySchema },
    ]),
    MongooseModule.forFeature([
        { name: 'VnIndex', schema: VnIndexSchema },
      ]),
  ],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
