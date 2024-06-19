import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VnIndexDocument = VnIndex & Document;

@Schema()
export class VnIndex {
  @Prop()
  closeIndex: number;

  @Prop()
  date: string;

  @Prop({ default: now() })
  createdAt: Date;

}

export const VnIndexSchema = SchemaFactory.createForClass(VnIndex);
