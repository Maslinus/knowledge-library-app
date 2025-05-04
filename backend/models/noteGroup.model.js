import mongoose from "mongoose";

const noteGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  noteIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InfNote',
    }
  ],
  userId: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#000000",
  },
});

const NoteGroup = mongoose.model('NoteGroup', noteGroupSchema);

export default NoteGroup