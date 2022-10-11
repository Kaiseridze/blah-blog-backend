import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";

import {
  registerValidator,
  loginValidator,
  postCreateValidator,
} from "./validators/index.js";

import {
  register,
  login,
  getMe,
  changeAvatar,
  removeAvatar,
} from "./controllers/UserControllers.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostComments,
  removePostById,
  updatePost,
} from "./controllers/PostController.js";

import {
  createComment,
  removeCommentById,
} from "./controllers/CommentController.js";

import { checkAuth, validationMiddleware } from "./middlewares/index.js";

// Express init
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Init storage of uploads
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    callback(null, "uploads");
  },
  filename: (_, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

// Mongoose init
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("db OK");
  })
  .catch((err) => {
    console.log("db error", err);
  });

// Auth/Login routes
app.post("/auth/login", loginValidator, validationMiddleware, login); // Sign in
app.post("/auth/register", registerValidator, validationMiddleware, register); // Sign up
app.get("/auth/me", checkAuth, getMe); // Check your profile
app.patch("/auth/me", checkAuth, changeAvatar);
app.delete("/auth/me", checkAuth, removeAvatar);

// Add image operation
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `uploads/${req.file.originalname}`,
  });
});

// CRUD operation
app.get("/posts", getAllPosts); // Fetch all posts
app.get("/posts/:id", getPostById); // Fetch one post
app.delete("/posts/:id", checkAuth, removePostById); // Remove post
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidator,
  validationMiddleware,
  updatePost
); // Edit and update post data

app.post(
  "/posts",
  checkAuth,
  postCreateValidator,
  validationMiddleware,
  createPost
); // Create new post

// Comments
app.post("/comments/:id", checkAuth, createComment); // Create new comment
app.get("/posts/comments/:id", getPostComments); // Get comments
app.delete("/posts/:id/comments/:comment_id", checkAuth, removeCommentById); // Remove comment

// Open ports
app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server OK");
});
