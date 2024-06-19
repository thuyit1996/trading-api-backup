import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../../schemas/chat';
import fetch from 'node-fetch';
@Injectable()
export class ChatService {
  constructor(@InjectModel('Chat') private readonly chatModel: Model<Chat>) {}
  public async sendMessage(body: { text?: string; file?: string }) {
    let url = '';
    if (body.text) {
      url = `https://api.telegram.org/bot${
        process.env.CHAT_TOKEN_ID
      }/sendMessage?text=${body.text || ''}&chat_id=${process.env.GROUP_ID}`;
    }
    if (body.file) {
      url = `https://api.telegram.org/bot${
        process.env.CHAT_TOKEN_ID
      }/sendPhoto?photo=${body.file || ''}&chat_id=${process.env.GROUP_ID}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data.ok) {
      const saveDataContent = {
        ...(body.text && { textContent: body.text }),
        ...(body.file && { fileUrl: body.file }),
      };
      new this.chatModel(saveDataContent).save();
      return {
        message: 'Gửi tin nhắn thành công',
        responseData: data,
      };
    } else {
      return {
        error: 1,
        message: 'Gửi tin nhắn không thành công',
        err: data,
      };
    }
  }
  public async getListMessage() {
    const listData = await this.chatModel.find();
    return listData;
  }
}
