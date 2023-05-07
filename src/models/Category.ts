import { Schema, model } from "mongoose";

import { ICategory } from "../interfaces/categoryInterface";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

export default model<ICategory>("Category", CategorySchema);
