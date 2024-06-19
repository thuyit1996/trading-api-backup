import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop()
  jwt: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
