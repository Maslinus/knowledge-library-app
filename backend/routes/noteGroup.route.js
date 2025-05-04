import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addGroup,
  editGroup,
  getAllGroups,
  deleteGroup
} from "../controller/noteGroup.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addGroup);
router.put("/edit/:groupId", verifyToken, editGroup);
router.get("/all", verifyToken, getAllGroups);
router.delete("/delete/:groupId", verifyToken, deleteGroup);

export default router;
