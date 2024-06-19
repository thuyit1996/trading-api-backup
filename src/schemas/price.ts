import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PriceDocument = Price & Document;

@Schema()
export class Price {
  @Prop()
  remainingPrice?: number;

  @Prop()
  userId?: string;
}

export const PriceSchema = SchemaFactory.createForClass(Price);
