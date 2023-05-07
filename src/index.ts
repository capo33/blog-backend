import app from "./app";
import { connectToMongoDB } from "./config/db";

// Connect to MongoDB
connectToMongoDB();

// Set port
const port: string = process.env.PORT || "3000";

// Start server
try {
  app.listen(port, (): void => {
    console.log(`Server is running on port ${port} 🚀`);
  });
} catch (error) {
  if (error instanceof Error) {
    console.log(`Error occured: (${error.message})`);
  }
}
