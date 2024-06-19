import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../../schemas/post';
@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  async createPost(body: {
    title: string;
    description: string;
    content: string;
  }) {
    try {
      const data = await new this.postModel(body).save();
      return {
        responseData: data,
      };
    } catch (error) {
      throw error;
    }
  }
}
