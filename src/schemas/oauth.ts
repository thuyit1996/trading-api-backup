import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OauthUserDocument = Oauth & Document;

@Schema()
export class Oauth {
  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  picture: string;

  @Prop()
  givenName?: string;

}

export const OauthUserSchema = SchemaFactory.createForClass(Oauth);
