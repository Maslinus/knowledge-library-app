import NoteGroup from "../models/noteGroup.model.js";
import { errorHandler } from "../utils/error.js";

export const addGroup = async (req, res, next) => {
  const { title, noteIds, color } = req.body;
  const { id } = req.user;

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }

  try {
    const group = new NoteGroup({
      title,
      noteIds: noteIds || [],
      userId: id,
      color: color || "#000000",
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    next(error);
  }
};

export const editGroup = async (req, res, next) => {
  const group = await NoteGroup.findById(req.params.groupId);

  if (!group) {
    return next(errorHandler(404, "Group not found"));
  }

  if (group.userId !== req.user.id) {
    return next(errorHandler(401, "You can only update your own group!"));
  }

  const { title, addNoteIds, removeNoteIds, color } = req.body;

  try {
    if (title) {
      group.title = title;
    }

    if (color) {
      group.color = color;
    }

    if (Array.isArray(addNoteIds)) {
      group.noteIds.push(...addNoteIds.filter(id => !group.noteIds.includes(id)));
    }

    if (Array.isArray(removeNoteIds)) {
      group.noteIds = group.noteIds.filter(id => !removeNoteIds.includes(id.toString()));
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGroups = async (req, res, next) => {
  try {
    const groups = await NoteGroup.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Groups retrieved successfully",
      groups,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  const group = await NoteGroup.findOne({ _id: req.params.groupId, userId: req.user.id });

  if (!group) {
    return next(errorHandler(404, "Group not found"));
  }

  try {
    await NoteGroup.deleteOne({ _id: req.params.groupId });

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
