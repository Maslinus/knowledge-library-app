import React, { useState } from 'react';
import ScrollableWithShadow from '../../utils/ScrollableWithShadow';

const NoteLinkModal = ({ onClose, onSelect, excludeId, notes = []}) => {
    const [search, setSearch] = useState('');

    const filtered = notes
      .filter(note => note._id !== excludeId)
      .filter((note) =>
      note.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Выберите заметку</h2>
        <input
          type="text"
          placeholder="Поиск по названию..."
          className="w-full p-2 mb-4 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollableWithShadow height='50vh' className="overflow-y-auto h-full border rounded-b-md shadow-md scroll-smooth" >
          {filtered.map((note) => (
            <button
              key={note._id}
              className="w-full text-left p-2 rounded hover:bg-blue-100 border"
              onClick={() => {
                onSelect(note);
                onClose();
              }}
            >
              {note.title}
            </button>
          ))}
        </ScrollableWithShadow>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          onClick={onClose}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default NoteLinkModal;