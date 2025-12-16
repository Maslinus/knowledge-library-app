import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";
import infNoteRouter from "./routes/infNote.route.js";
import uploadRouter from "./routes/upload.route.js";
import groupRouter from "./routes/noteGroup.route.js";
import versionRouter from "./routes/noteVersion.route.js";

const app = express();
console.log("Express app created (app.js)");

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://marvelous-panda-f9f040.netlify.app",
  ],
  credentials: true,
}));

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);
app.use("/api/infNote", infNoteRouter);
app.use("/api/uploadCloud", uploadRouter);
app.use("/api/group", groupRouter);
app.use("/api/versions", versionRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Global error:", err);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;
