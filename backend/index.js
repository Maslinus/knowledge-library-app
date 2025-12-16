import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
console.log("Express app created");

app.use(express.json());
console.log("express.json middleware attached");

app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://marvelous-panda-f9f040.netlify.app"
  ],
  credentials: true
}));

import authRouter from "./routes/auth.route.js";
console.log("authRouter imported:", !!authRouter);

import noteRouter from "./routes/note.route.js";
console.log("noteRouter imported:", !!noteRouter);

import infNoteRouter from "./routes/infNote.route.js";
console.log("infNoteRouter imported:", !!infNoteRouter);

import uploadRouter from "./routes/upload.route.js";
console.log("uploadRouter imported:", !!uploadRouter);

import groupRouter from "./routes/noteGroup.route.js";
console.log("groupRouter imported:", !!groupRouter);

import versionRouter from "./routes/noteVersion.route.js";
console.log("versionRouter imported:", !!versionRouter);

console.log(authRouter);
app.use("/api/auth", authRouter);
console.log("authRouter attached");

app.use("/api/note", noteRouter);
console.log("noteRouter attached");

app.use("/api/infNote", infNoteRouter);
console.log("infNoteRouter attached");

app.use("/api/uploadCloud", uploadRouter);
console.log("uploadRouter attached");

app.use("/api/group", groupRouter);
console.log("groupRouter attached");

app.use("/api/versions", versionRouter);
console.log("versionRouter attached");

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB error:", err));

export default app;