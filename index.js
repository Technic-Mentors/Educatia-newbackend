import express from "express";
import mongoDbConnection from "./db.js";
import userControllers from "./Controllers/userControllers.js";
import categoryController from "./Controllers/CategoryControllers.js";
import blogController from "./Controllers/BlogControllers.js";
import blogCategoryController from "./Controllers/BlogCategoryController.js";
import UniversityController from "./Controllers/UniversityController.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import cors from "cors";

// Connect to DB
mongoDbConnection();

const app = express();

// Setup CORS
app.use(cors())

app.use(express.json());

// Routes
app.use("/api/user", userControllers);
app.use("/api/category", categoryController);
app.use("/api/blog", blogController);
app.use("/api/blogCat", blogCategoryController);
app.use("/api/uni", UniversityController);
app.use("/api/tickets", ticketRoutes);

// Start server
app.listen(8000, () => {
  console.log("App listening at http://localhost:8000");
});
