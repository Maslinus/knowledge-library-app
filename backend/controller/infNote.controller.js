import InfNote from "../models/infNote.model.js";
import { errorHandler } from "../utils/error.js";

export const addNote = async (req, res, next) => {
    const { title, description, blocks, tags } = req.body;
    const { id } = req.user;
  
    if (!title) {
      return next(errorHandler(400, "Title is required"));
    }
  
    if (!description) {
      return next(errorHandler(400, "description is required"))
    }

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return next(errorHandler(400, "At least one block is required"));
    }
  
    try {
      const note = new InfNote({
        title,
        description,
        blocks,
        tags: tags || [],
        userId: id,
      });
  
      await note.save();
  
      res.status(201).json({
        success: true,
        message: "Note added successfully",
        note,
      });
    } catch (error) {
      next(error);
    }
  };

export const editNote = async (req, res, next) => {
  const note = await InfNote.findById(req.params.noteId);

  if (!note) {
    return next(errorHandler(404, "Note not found"));
  }

  if (req.user.id !== note.userId) {
    return next(errorHandler(401, "You can only update your own note!"));
  }

  const { title, description, blocks, tags, isPinned } = req.body;

  if (!title && !description && !blocks && !tags && isPinned === undefined) {
    return next(errorHandler(400, "No changes provided"));
  }

  try {
    if (title) {
      note.title = title;
    }

    if (description) {
      note.description = description;
    }

    if (Array.isArray(blocks)) {
      note.blocks = blocks;
    }

    if (tags) {
      note.tags = tags;
    }

    if (isPinned !== undefined) {
      note.isPinned = isPinned;
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllNotes = async (req, res, next) => {
  try {
    const notes = await InfNote.find({ userId: req.user.id }).sort({ isPinned: -1 });

    res.status(200).json({
      success: true,
      message: "All notes retrieved successfully",
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  const note = await InfNote.findOne({ _id: req.params.noteId, userId: req.user.id });

  if (!note) {
    return next(errorHandler(404, "Note not found"));
  }

  try {
    await InfNote.deleteOne({ _id: req.params.noteId });

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotePinned = async (req, res, next) => {
  try {
    const note = await InfNote.findById(req.params.noteId);

    if (!note) {
      return next(errorHandler(404, "Note not found!"));
    }

    if (req.user.id !== note.userId) {
      return next(errorHandler(401, "You can only update your own note!"));
    }

    note.isPinned = req.body.isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const searchNote = async (req, res, next) => {
  const { query, tags, startDate, endDate } = req.query;

  try {
    const hasQuery = query && query.trim() !== "";

    const filter = {
      userId: req.user.id,
    };

    if (hasQuery) {
      filter.$or = [
        { title: { $regex: new RegExp(query, "i") } },
        { description: { $regex: new RegExp(query, "i") } },
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",")
        : [];

      if (tagArray.length > 0) {
        filter.tags = { $all: tagArray };
      }
    }

    if (startDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(endDate);
    }

    const matchingNotes = await InfNote.find(filter);

    res.status(200).json({
      success: true,
      message: "Notes matching the search query retrieved successfully",
      notes: matchingNotes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await InfNote.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Заметка не найдена" });
    }
    return res.status(200).json({ success: true, note });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Ошибка сервера", error });
  }
};