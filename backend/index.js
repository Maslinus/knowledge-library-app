import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config()

mongoose.connect(process.env.MONGO_URL).then(() =>{
    console.log("Connected to mongoDB");
}).catch((err) =>{
    console.log(err)    
})

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }))

app.listen(3000, () =>{
    console.log("Server is ranning on port 3000")
})

import authRouter from "./routes/auth.route.js"
import noteRouter from "./routes/note.route.js"
import infNoteRouter from "./routes/infNote.route.js"
import uploadRouter from "./routes/upload.route.js";
import groupRouter from "./routes/noteGroup.route.js";

app.use("/api/auth", authRouter)
app.use("/api/note", noteRouter)
app.use("/api/infNote", infNoteRouter)
app.use("/api/uploadCloud", uploadRouter);
app.use("/api/group", groupRouter);

app.use((err, req, res, next) =>{
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})