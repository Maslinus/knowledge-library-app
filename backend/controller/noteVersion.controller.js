import InfNote from "../models/infNote.model.js";
import NoteVersion from "../models/noteVersionSchema.js";
import { errorHandler } from "../utils/error.js";

export const saveNoteVersion = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user.id;
  const { title, description, blocks, tags } = req.body;

  try {
    const note = await InfNote.findOne({ _id: noteId, userId });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    const version = new NoteVersion({
      noteId: note._id,
      userId,
      title,
      description,
      blocks,
      tags,
    });

    await version.save();

    note.versions.push(version._id);
    await note.save();
    
    res.status(201).json({
      success: true,
      message: "Note version saved successfully",
      version,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteVersions = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    const versions = await NoteVersion.find({ noteId, userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Note versions retrieved successfully",
      versions,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNoteVersion = async (req, res, next) => {
  const { versionId } = req.params;
  const userId = req.user.id;
  const { title, description, blocks, tags } = req.body;

  try {
    const version = await NoteVersion.findOne({ _id: versionId, userId });

    if (!version) {
      return next(errorHandler(404, "Версия не найдена"));
    }

    version.title = title;
    version.description = description;
    version.blocks = blocks;
    version.tags = tags;

    await version.save();

    res.status(200).json({
      success: true,
      message: "Версия успешно обновлена",
      version,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNoteVersion = async (req, res, next) => {
  const { versionId } = req.params;
  const userId = req.user.id;

  try {
    const version = await NoteVersion.findOne({ _id: versionId, userId });
    if (!version) {
      return next(errorHandler(404, "Версия не найдена"));
    }

    await NoteVersion.deleteOne({ _id: versionId });

    await InfNote.updateOne(
      { _id: version.noteId, userId },
      { $pull: { versions: versionId } }
    );

    res.status(200).json({
      success: true,
      message: "Версия успешно удалена",
    });
  } catch (error) {
    next(error);
  }
};