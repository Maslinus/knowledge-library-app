import { useState } from "react";
import { MdAdd, MdNoteAdd } from "react-icons/md";

const AddNoteButton = ({ setOpenAddEditModal, setOpenAddEditModalInf }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed  right-10 bottom-10">
      {isExpanded ? (
        <div className="flex flex-col items-end space-y-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-2xl bg-green-500 hover:bg-green-600"
            onClick={() => {
              setOpenAddEditModal({ isShown: true, type: "add", data: null });
              setIsExpanded(false);
            }}
            title="Создать заметку"
          >
            <MdNoteAdd className="text-[32px] text-white" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-2xl bg-yellow-500 hover:bg-yellow-600"
            onClick={() => {
              setOpenAddEditModalInf({ isShown: true, type: "add", data: null });
              setIsExpanded(false);
            }}
            title="Создать инфозаметку"
          >
            <MdNoteAdd className="text-[32px] text-white" />
          </button>
        </div>
      ) : (
        <button
          className="w-8 h-8 flex items-center justify-center rounded-2xl bg-[#2B85FF] hover:bg-blue-600"
          onClick={() => setIsExpanded(true)}
          title="Создать"
        >
          <MdAdd className="text-[32px] text-white" />
        </button>
      )}
    </div>
  );
};

export default AddNoteButton;
