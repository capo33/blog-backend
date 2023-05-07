import { NextFunction, Request, Response } from "express";
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
    const photo = {
      name: originalname,
      url: path,
    };
    const parts = originalname.split(".");
    const extension = parts[parts.length - 1];
    const newPath = `${path}.${extension}`;
    fs.renameSync(path, newPath);

    // get data

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
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

export { getBlogs, getBlog, getFeaturedBlogs, createBlog , updateBlog};
