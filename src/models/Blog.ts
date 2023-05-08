import { Schema, model } from "mongoose";

import { IBlog } from "../interfaces/blogInterface";

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      // required: [true, "Please add a title"],
    },
    description: {
      type: String,
      // required: [true, "Please add a description"],
    },
    photo: {
      type: String,
      default: "https://t4.ftcdn.net/jpg/04/99/93/31/360_F_499933117_ZAUBfv3P1HEOsZDrnkbNCt4jc3AodArl.jpg",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

export default model<IBlog>("Blog", BlogSchema);
