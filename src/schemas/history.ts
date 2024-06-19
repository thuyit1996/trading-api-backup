import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HistoryDocument = History & Document;

@Schema()
export class History {
  @Prop()
  total: number;

  @Prop()
  createdAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
