import mongoose from "mongoose";

  const infNoteSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    blocks: { 
      type: [{ 
        type: Object,
        required: true,
      }],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true
    },
    versions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "NoteVersion",
      default: [],
    }]
  },
    {
      timestamps: true
    },
  );

  const InfNote = mongoose.model("InfNote", infNoteSchema)
  
export default InfNote