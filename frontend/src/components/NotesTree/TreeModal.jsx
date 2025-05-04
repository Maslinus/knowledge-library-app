import React, { useMemo } from "react";
import NoteTree from "./NotesTree";
import { getNoteTree } from "../../utils/getNoteTree";

const TreeModal = ({ onClose, allNotes, rootNoteId, onSelectNote }) => {
  const notesMap = useMemo(() => new Map(allNotes.map(n => [n._id, n])), [allNotes]);
  const noteTree = useMemo(() => getNoteTree(rootNoteId, notesMap), [rootNoteId, notesMap]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50">
      <NoteTree
        tree={noteTree}
        onSelect={(noteId) => {
          onClose();
          onSelectNote(noteId);
        }}
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow text-red-600 font-semibold hover:bg-red-100 z-50"
      >
        ✕ Закрыть
      </button>
    </div>
  );
};

export default TreeModal;