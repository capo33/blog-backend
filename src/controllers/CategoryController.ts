import slugify from "slugify"; // slugify is a function that converts a string into a slug (a string that can be used in a URL)

import CategoryModel from "../models/Category";
import { NextFunction, Request, Response } from "express";

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await CategoryModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:slug
// @access  Public
const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  try {
    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      throw new Error("Category not found");
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  try {
    // Check if category already exists
    const exisringCategoty = await CategoryModel.findOne({ name });

    if (exisringCategoty) {
      next("Category already exists");
    }

    // Create category
    const category = new CategoryModel({
      name,
      slug: slugify(name),
    });

    await category.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:slug
// @access  Private/Admin
const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    const updartedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updartedCategory,
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedCategory = await CategoryModel.findOne({ _id: id });

    if (!deletedCategory) {
      throw new Error("Category not found");
    }

    await deletedCategory.deleteOne();
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

export { getCategory, createCategory, updateCategory, deleteCategory };
