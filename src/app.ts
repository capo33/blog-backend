import express, { Application, NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/Auth.routes";
import { errorHandler, notFound } from "./middlewares/errorHandler";

// Load env vars
dotenv.config();

// Initialize express
const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Welcome route
app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.json({
    message: "Welcome to the MongoDB API",
    author: "Mohamed Capo",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);

// Error handler middleware
app.use(notFound);
app.use(errorHandler);

export default app;
