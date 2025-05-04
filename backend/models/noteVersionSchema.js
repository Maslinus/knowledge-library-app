import mongoose from "mongoose";

const noteVersionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InfNote",
    required: true,
  },
  title: String,
  description: String,
  blocks: [Object],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NoteVersion = mongoose.model("NoteVersion", noteVersionSchema);

export default NoteVersion;