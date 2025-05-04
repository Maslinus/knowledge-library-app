import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { deleteNoteVersion, getNoteVersions, saveNoteVersion, updateNoteVersion } from "../controller/NoteVersion.controller.js";


const router = express.Router();

router.post("/save/:noteId", verifyToken, saveNoteVersion);
router.get("/:noteId", verifyToken, getNoteVersions);
router.put("/update/:versionId", verifyToken, updateNoteVersion);
router.delete("/delete/:versionId", verifyToken, deleteNoteVersion);

export default router;