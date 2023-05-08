import {Document, Types } from "mongoose";

export interface IBlog extends Document {
  title: string;
  description: string;
  photo: string;
  author:  Types.ObjectId;
  category:  Types.ObjectId;
  likes:  Types.ObjectId[];
  views: number;
  featured: boolean;
  tags: string[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}