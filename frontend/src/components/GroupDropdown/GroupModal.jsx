import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ScrollableWithShadow from "../../utils/ScrollableWithShadow";
import { MdClose, MdSave, MdUpdate } from "react-icons/md";

const GroupModal = ({
  onClose,
  type = "create",
  group = null,
  allNotes = [],
  getAllGroups,
}) => {
  const isEdit = type === "edit";

  const initialTitle = isEdit && group ? group.title : "";
  const initialColor = isEdit && group ? group.color || "#3b82f6" : "#3b82f6";
  const initialSelectedNotes = isEdit && group ? new Set(group.noteIds.map(id => id.toString())) : new Set();

  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);
  const [selectedNotes, setSelectedNotes] = useState(initialSelectedNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [error, setError] = useState("");

  const handleCheckboxChange = (noteId) => {
    setSelectedNotes((prev) => {
      const newSet = new Set(prev);
      newSet.has(noteId) ? newSet.delete(noteId) : newSet.add(noteId);
      return newSet;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title.trim()) {
      setError("Название обязательно");
      return;
    }
  
    try {
      if (isEdit && group) {
        const currentNoteIds = new Set(group.noteIds.map(id => id.toString()));
        const updatedNoteIds = selectedNotes;
  
        const addNoteIds = Array.from(updatedNoteIds).filter(id => !currentNoteIds.has(id));
        const removeNoteIds = Array.from(currentNoteIds).filter(id => !updatedNoteIds.has(id));
  
        const res = await axios.put(
          `${API_URL}/group/edit/${group._id}`,
          {
            title,
            color,
            addNoteIds,
            removeNoteIds
          },
          { withCredentials: true }
        );
  
        if (res.data.success) {
          toast.success("Группа обновлена");
          getAllGroups();
          onClose();
        }
      } else {
        const res = await axios.post(
          `${API_URL}/group/add`,
          {
            title,
            color,
            noteIds: Array.from(selectedNotes)
          },
          { withCredentials: true }
        );
  
        if (res.data.success) {
          toast.success("Группа создана");
          getAllGroups();
          onClose();
        }
      }
    } catch (err) {
      toast.error("Ошибка при сохранении группы");
      console.error(err);
    }
  };

  const filteredNotes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const tagTerm = tagSearchTerm.toLowerCase();
  
    return allNotes.filter(note => {
      const inTitle = note.title.toLowerCase().includes(term);
      const inDescription = note.description.toLowerCase().includes(term);
      const inTags = tagTerm
        ? note.tags?.some(tag => tag.toLowerCase().includes(tagTerm))
        : true;
  
      return (inTitle || inDescription) && inTags;
    });
  }, [searchTerm, tagSearchTerm, allNotes]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center z-50"
    >
      <div className='py-[1%] px-[1%]'>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500 text-white hover:bg-teal-700"
          title={isEdit ? "Обновить" : "Сохранить"}
          onClick={handleSubmit}
        >
          {isEdit ? <MdUpdate/> : <MdSave/>}
        </button>
      </div>
      <div
      className="bg-white rounded-lg w-[60%]  h-full"
      >
        <div className="p-2">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div>
            <div className="flex gap-2 items-center p-2">
              <input
                type="text"
                className="w-full border rounded"
                placeholder="Название группы"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 cursor-pointer"
                title="Выберите цвет группы"
              />
            </div>
            <div className="flex">
              <input
                type="text"
                className="w-full bg-slate-100 border p-2 rounded-t-md"
                placeholder="Поиск по заметкам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                className="w-full bg-slate-100 border p-2 rounded-t-md"
                placeholder="Поиск по тегам..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
              />
            </div>

            <ScrollableWithShadow className="bg-slate-100 overflow-y-auto h-full border rounded-b-md shadow-md scroll-smooth" height='84vh'>
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-gray-500">Заметки не найдены</p>
              ) : (
                filteredNotes.map(note => (
                  <label
                    key={note._id}
                    className="block p-2 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <div className="flex  justify-between">
                      <div className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedNotes.has(note._id)}
                          onChange={() => handleCheckboxChange(note._id)}
                          className="mt-1"
                        />
                          <div>
                            <p className="font-medium">{note.title}</p>
                            <p className="text-gray-500 text-xs line-clamp-2">{note.description}</p>
                          </div>
                      </div>
                      <div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {note.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-200 text-blue-800 text-xs px-2 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          </div>
                    </div>
                  </label>
                ))
                
              )}
            </ScrollableWithShadow>
          </div>
        </div>
      </div>
      <div className='py-[1%] px-[1%]'>
        <button
        type="button"
        onClick={onClose}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-700"
        title="Отменить"
        >
          <MdClose className="text-xl text-slate-50"/>
        </button>
      </div>
    </div>
  );
};

export default GroupModal;