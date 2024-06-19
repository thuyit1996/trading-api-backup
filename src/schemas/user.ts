import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop()
  fullName: string;

  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// export interface User extends Document {
//     email: string;
//     username: string;
//     phone: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//     role: string;
// }

// export const UserSchema: Schema = new Schema({
//     email: { type: String },
//     username: { type: String },
//     password: { type: String },
//     firstName: { type: String },
//     lastName: { type: String },
//     phone: { type: String },
//     role: { type: String },
// }, {
//     timestamps: { createdAt: true, updatedAt: true },
//     versionKey: false,
// })
