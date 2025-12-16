import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { deleteFile, uploadFile } from "../controller/upload.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post("/upload", verifyToken, upload.single("file"), uploadFile);
router.post("/delete", verifyToken, deleteFile);

export default router;