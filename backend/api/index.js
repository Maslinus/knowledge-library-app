import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "../routes/auth.route.js";
import noteRouter from "../routes/note.route.js";
import infNoteRouter from "../routes/infNote.route.js";
import uploadRouter from "../routes/upload.route.js";
import groupRouter from "../routes/noteGroup.route.js";
import versionRouter from "../routes/noteVersion.route.js";

import connectToDatabase from "../utils/connectDB.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://knowledge-library.netlify.app"
  ],
  credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);
app.use("/api/infNote", infNoteRouter);
app.use("/api/uploadCloud", uploadRouter);
app.use("/api/group", groupRouter);
app.use("/api/versions", versionRouter);

app.get("/api", (req, res) => res.json({ message: "Backend is running!" }));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({ success: false, statusCode, message });
});

export default async function handler(req, res) {
  await connectToDatabase(process.env.MONGO_URL);
  return serverless(app)(req, res);
}