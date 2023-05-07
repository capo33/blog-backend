import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  answer: string;
  avatar: string;
  role: string;
  interests: string[];
  about: string;
  blogs: string[];
  phone: string;
  address: string;
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
}
