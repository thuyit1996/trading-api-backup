import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {

    }
    @Get('/send-message')
    async sendMessage(@Req() request: Request) {
        const { query } = request;
        try {
            const sendMessge = await this.chatService.sendMessage({
                ...(query.text && { text: query.text as string }),
                ...(query.file && { file: query.file as string }),
            });
            return sendMessge;
        } catch (error) {
            throw error;
        }
    }

    @Get('/get-messages')
    async getMessages() {
        try {
            const data = await this.chatService.getListMessage() || [];
            return {
                responseData: data,
            }
        } catch (error) {
            throw error;
        }
    }
}