import { FaFilter } from "react-icons/fa6";
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NoteFilterPopover = ({
    selectedTags,
    handleSearch,
    tags,
    onTagsChange,
    startDate,
    endDate,
    setStartDate,
    setEndDate, 
    onClearSearch}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFilter = () => {
        setIsOpen(prevState => !prevState);
    };

    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
          onTagsChange(selectedTags.filter(t => t !== tag))
        } else {
          onTagsChange([...selectedTags, tag])
        }
    };

    const filteredTags = tags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="relative">
            <button>
                <FaFilter
                    className="w-6 h-6 text-slate-500 hover:text-black cursor-pointer"
                    onClick={toggleFilter}
                />
            </button>

            {isOpen && (
                <div className="absolute bg-white border rounded-md shadow-lg p-2 w-[190px] sm:w-[270px] md:w-[350px] xl:w-[350px]">
                    <p>По тегам:</p>
                   <input
                        type="text"
                        placeholder="Поиск по тегам..."
                        className="w-full p-2 mb-1 border rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="border-b-2 border-slate-500 py-1 bg-slate-100 overflow-x-auto whitespace-nowrap no-scrollbar">
                        {filteredTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                className={`px-4 py-2 mx-1 rounded-md text-sm bg-white
                                ${selectedTags.includes(tag) ? 'border-2 border-green-500 text-green-500' : 'border border-gray-300'} 
                                hover:bg-gray-100 focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap`}
                                title={tag}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    По времени создания:

                    <div className="border-b-2 border-slate-500 flex items-center justify-around">
                        <div className="py-1">
                            <label className="block text-sm">С:</label>
                            <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            dateFormat="yyyy-MM-dd"
                            className="border p-1 rounded-md w-[60%]"
                            />
                        </div>
                        <div className="py-1">
                            <label className="block text-sm">По:</label>
                            <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            dateFormat="yyyy-MM-dd"
                            className="border p-1 rounded-md w-[60%]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-around">
                        <button className="mt-2 p-2 border bg-white border-gray-300 rounded-md text-sm hover:bg-gray-100 focus:outline-none
                                overflow-hidden text-ellipsis whitespace-nowrap" onClick={handleSearch}>
                            Применить фильтр
                        </button>
                        <button className="mt-2 p-2 border bg-white border-gray-300 rounded-md text-sm hover:bg-gray-100 focus:outline-none
                                overflow-hidden text-ellipsis whitespace-nowrap" onClick={onClearSearch}>
                            Очистить фильтр
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteFilterPopover;