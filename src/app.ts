import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/Auth.routes";

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

export default app;
