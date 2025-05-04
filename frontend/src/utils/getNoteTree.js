export const getNoteTree = (noteId, notesMap, visited = new Set()) => {
  if (visited.has(noteId)) return null;
  visited.add(noteId);

  const note = notesMap.get(noteId);
  if (!note) return null;

  const children = (note.blocks || [])
  .filter(block => block.type === 'noteLink')
  .map(block => getNoteTree(block.noteId, notesMap, visited))
  .filter(Boolean);

  return {
    id: note._id,
    title: note.title,
    description: note.description,
    createdAt: note.createdAt,
    tags: note.tags,
    children,
  };
}; 