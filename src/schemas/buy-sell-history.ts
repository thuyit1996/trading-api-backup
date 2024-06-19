import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BuyHistoryDocument = BuyHistory & Document;

@Schema()
export class BuyHistory {
  @Prop()
  quantity: number;

  @Prop()
  ticker: string;

  @Prop()
  price: number;

  @Prop()
  createdAt: Date;

  @Prop()
  type: 'buy' | 'sell';
}

export const BuyHistorySchema = SchemaFactory.createForClass(BuyHistory);
