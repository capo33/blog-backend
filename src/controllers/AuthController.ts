import { Request, Response } from "express";
import { Types } from "mongoose";
import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User";
import { generateToken } from "../utils/JwtToken";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
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
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
export const getProfile = async (req: Request, res: Response) => {
  try {
    // get user from req.user
    const user = req.user;

    // send response
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
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
