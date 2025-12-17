// backend/api/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";

import authRouter from "../routes/auth.route.js";
import noteRouter from "../routes/note.route.js";
import infNoteRouter from "../routes/infNote.route.js";
import uploadRouter from "../routes/upload.route.js";
import groupRouter from "../routes/noteGroup.route.js";
import versionRouter from "../routes/noteVersion.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);
app.use("/api/infNote", infNoteRouter);
app.use("/api/uploadCloud", uploadRouter);
app.use("/api/group", groupRouter);
app.use("/api/versions", versionRouter);

app.get("/api", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

let conn = null;

const connectDB = async () => {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");
  return conn;
};

export default async function handler(req, res) {
  await connectDB();
  return serverless(app)(req, res);
}