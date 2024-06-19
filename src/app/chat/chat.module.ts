
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from '../../schemas/chat';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }])],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [],
})
export class ChatModule { }
