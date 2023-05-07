import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import UserModel from "../models/User";
import { generateToken } from "../utils/JwtToken";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req: Request, res: Response) => {
  const { name, email, password, answer } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      answer,
    });

    // generate token
    const token = generateToken(newUser._id);

    // Take out password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject(); // we use toObject() instead of _doc in typescript to get the user object without the password

    // send response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: userWithoutPassword,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error)
      res.status(400).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    // Check if user exists
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      throw new Error("User does not exist");
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials");
    }

    // generate token
    const token = generateToken(existingUser?._id);

    // Take out password from response
    const { password: _, ...userWithoutPassword } = existingUser.toObject();

    // send response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: userWithoutPassword,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error)
      res.status(400).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req: Request, res: Response) => {
  try {
    // get user from req.user
    const user = await UserModel.findById(req.user?._id).select("-password");

    // check user existince
    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    // generate token
    const token = generateToken(user?._id);

    // Remove password
    const { password: _, ...result } = user.toObject();

    console.log(user);

    // send response
    res.status(200).json({
      success: true,
      message: "User found",
      result,
      token,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error)
      res.status(400).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update
// @access  Private
const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists
    const user = await UserModel.findById(req.user?._id); // req.user?._id is set by the auth middleware

    if (!user) {
      throw new Error("User not found");
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      { ...req.body, password: hashedPassword },
      { new: true }
    );
    // Create token
    const token = generateToken(updatedUser?._id);

    // send response
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
      token,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Update user password
// @route   PUT /api/v1/auth/update-password
// @access  Private
const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists
    const user = await UserModel.findById(req.user?._id); // req.user?._id is set by the auth middleware

    if (!user) {
      throw new Error("User not found");
    }

    // compare passwords
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials");
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      { password: hashedPassword },
      { new: true }
    );

    // Create token
    const token = generateToken(updatedUser?._id);

    // send response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user: updatedUser,
      token,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get users
    const users = await UserModel.find({}).select("-password");

    // send response
    res.status(200).json({
      success: true,
      message: "List of users",
      users,
    });

    // catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/auth/user/:id
// @access  Private/Admin or User
const deleteUserByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get user
    const user = await UserModel.findById(req.user?._id);

    // check user existince
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is authorized to delete the user
    if (
      user._id.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new Error("You are not authorized to delete this user");
    }
    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sad to see you go, user deleted successfully",
    });

    //  catch errors
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

// @desc    Delete users
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
const deleteUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.params.id);
    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }
    // Check if admin is authorized to delete the user
    if (req.user?.role !== "admin") {
      throw new Error("You are not authorized to delete this user");
    }

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) next(error.message);
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  getUsers,
  deleteUserByUser,
  deleteUserByAdmin,
};
