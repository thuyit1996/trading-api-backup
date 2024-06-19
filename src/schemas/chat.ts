
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
    @Prop()
    textContent?: string;

    @Prop()
    fileUrl?: string;

    @Prop({ default: now() })
    createdAt: Date;

}

export const ChatSchema = SchemaFactory.createForClass(Chat);
