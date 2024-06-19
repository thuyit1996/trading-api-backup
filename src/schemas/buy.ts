import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BuDocument = Buy & Document;

@Schema()
export class Buy {
  @Prop()
  ticker: string;

  @Prop()
  price?: number;

  @Prop()
  quantity?: number;

  @Prop()
  strategy?: string;
}

export const BuySchema = SchemaFactory.createForClass(Buy);
