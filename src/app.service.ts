import { HttpStatus, Injectable, Res } from '@nestjs/common';

@Injectable()
export class AppService {
  MAX_RNG_VALUE: number = 4;

  constructor() { }

  getHello(): string {
    return `Hello !`;
  }
}
