import {
    Body,
    Controller,
    InternalServerErrorException,
    Post,
  } from '@nestjs/common';
  import { PostService } from './post.service';
  
  @Controller('post')
  export class PostController {
    constructor(private readonly postService: PostService) {}
    @Post('/')
    async createPost(
      @Body() body: { title: string; description: string; content: string },
    ) {
      try {
        await this.postService.createPost(body);
        return {
          responseData: true,
        };
      } catch (error) {
        throw new InternalServerErrorException('Something went wrong !');
      }
    }
  }
  