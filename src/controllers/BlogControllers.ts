import { NextFunction, Request, Response, query } from "express";
import mongoose from "mongoose";
import fs from "fs";

import BlogModel from "../models/Blog";

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get blogs
    const blogs = await BlogModel.find({})
      .populate("author", "-password")
      .sort({ createdAt: -1 })
      .populate("category", "name");

    // send response
    res.status(200).json({
      success: true,
      message: "All blogs",
      length: blogs?.length,
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get single blog
// @route   GET /api/v1/blogs/:id
// @access  Public
const getBlog = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const blog = await BlogModel.findById(id).populate("author", "-password");

    // Check if blog exists
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Increment views
    blog?.updateOne({ $inc: { views: 1 } });

    // send respons
    res.status(200).json({
      success: true,
      message: "Blog found",
      blog,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Featured blogs
// @route   GET /api/v1/blogs/featured
// @access  Public
const getFeaturedBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get blogs
    const blogs = await BlogModel.find({ featured: true })
      .populate("author", "-password")
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("category", "name");

    // send response
    res.status(200).json({
      success: true,
      message: "Featured blogs",
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Create blog
// @route   POST /api/v1/blogs
// @access  Private
const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error("You are not authenticated");
    }
    const { originalname, path } = req.file as Express.Multer.File;

    const parts = originalname.split(".");
    const extension = parts[parts.length - 1];
    const newPath = `${path}.${extension}`;
    fs.renameSync(path, newPath);

    // create blog
    const blog = await BlogModel.create({
      ...req.body,
      photo: newPath,
      author: req.user,
    });

    // send response
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      throw new Error("You are not authenticated");
    }

    const blog = await BlogModel.findById(id);

    // Check if blog exists
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Check if user is the author
    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new Error("You are not authorized to update this blog");
    }

    // remove old photo
    if (req.file) {
      const { photo } = blog;
      fs.unlinkSync(photo);
    }

    // update blog
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      { ...req.body, photo: req.file?.path },
      { new: true }
    );

    // send response
    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
      author: req.user,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private
const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      throw new Error("You are not authenticated");
    }
    const blog = await BlogModel.findById(id);

    //  Check if user is authorized to delete the blog
    if (
      blog?.author?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new Error("You are not authorized to update this blog");
    }

    // remove photo
    if (blog?.photo) {
      fs.unlinkSync(blog.photo);
    }

    // delete blog
    await BlogModel.findByIdAndDelete(id);

    // send response
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Like blog
// @route   PUT /api/v1/blogs/like/:id
// @access  Private
const likeBlog = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      throw new Error("You are not authenticated");
    }
    // check if blog exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Blog not found");
    }
    const blog = await BlogModel.findById(id);

    // check if user has already liked the blog then unlike it
    const index = blog?.likes.findIndex((id) => id === req.user?._id);

    // if the user has not liked the blog, add user id to likes array
    if (index === -1) {
      blog?.likes.push(req.user?._id);
    } else {
      if (!blog?.likes === undefined) {
        // if the user has liked the blog, remove user id from likes array
        blog!.likes
          ? blog?.likes.filter((id) => id !== req.user?._id)
          : blog?.likes;
      }
    }

    // update blog
    const updatedLikeBlog = await BlogModel.findByIdAndUpdate(
      id,
      { likes: blog?.likes },
      { new: true }
    );
    // send response
    res.status(200).json(updatedLikeBlog);

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get blogs by tag
// @route   GET /api/v1/blogs/tag/:tag
// @access  Public
const getBlogsByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tag } = req.params;
  try {
    // $in is a mongoDB operator that searches for all occurences of the tag in the tags array
    const blogs = await BlogModel.find({ tags: { $in: tag } }).populate(
      "author",
      "-password"
    );

    // send response
    res.status(200).json({
      success: true,
      message: "Blogs by tag",
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get related blogs
// @route   GET /api/v1/blogs/related
// @access  Public
const getRelatedBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tags = req.body;
  try {
    const blogs = await BlogModel.find({ tags: { $in: tags } }).populate(
      "author",
      "-password"
    );

    // send response
    res.status(200).json({
      success: true,
      message: "Related blogs",
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get blogs by author
// @route   GET /api/v1/blogs/author/:id
// @access  Public
const getBlogsByAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    // $in is a mongoDB operator that searches for all occurences of the tag in the tags array
    const blogs = await BlogModel.find({ author: id }).populate(
      "author",
      "-password"
    );

    // send response
    res.status(200).json({
      success: true,
      message: "Blogs by author",
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get blogs by category
// @route   GET /api/v1/blogs/category/:category
// @access  Public
const getBlogsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { category } = req.params;
  try {
    // $in is a mongoDB operator that searches for all occurences of the tag in the tags array
    const blogs = await BlogModel.find({ category }).populate(
      "author",
      "-password"
    );

    // send response
    res.status(200).json({
      success: true,
      message: "Blogs by category",
      blogs,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get blogs by search query
// @route   GET /api/v1/blogs/search?searchQuery = something
// @access  Public

interface RequestWithQuery extends Request {
  query: {
    searchQuery: string;
  };
}

const getBlogsBySearch = async (
  // req: RequestWithQuery,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { searchQuery } = req.query;
  try {
    // const title = new RegExp(searchQuery as string, "i");
    const description = new RegExp(searchQuery as string, "i");
    // i is for case insensitive search and g is for global search (searches for all occurences of the query)
    const blogs = await BlogModel.find({ description });

    // send response
    res.status(200).json(blogs);

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

export {
  getBlogs,
  getBlog,
  getFeaturedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getBlogsByTag,
  getRelatedBlogs,
  getBlogsByAuthor,
  getBlogsByCategory,
  getBlogsBySearch,
};
