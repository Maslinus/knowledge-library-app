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
            <button onClick={toggleFilter}>
                <FaFilter className="w-6 h-6 text-slate-500 hover:text-black cursor-pointer" />
            </button>

            <div
                className={`
                    absolute top-full mt-2 z-10 bg-white border rounded-md shadow-lg p-4
                    w-[190px] sm:w-[270px] md:w-[350px] xl:w-[350px]
                    transition-all duration-300 ease-out transform origin-top
                    ${isOpen ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-y-75 -translate-y-2 pointer-events-none"}
                `}
            >
                {/* Содержимое фильтра */}
                <p className="mb-1">По тегам:</p>
                <input
                    type="text"
                    placeholder="Поиск по тегам..."
                    className="w-full p-2 mb-2 border rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="border-b-2 border-slate-500 py-2 bg-slate-100 overflow-x-auto whitespace-nowrap no-scrollbar">
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
                <p className="mt-2">По времени создания:</p>
                <div className="border-b-2 border-slate-500 flex items-center justify-around py-2">
                    <div>
                        <label className="block text-sm">С:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            dateFormat="dd-MM-yyyy"
                            className="border p-1 rounded-md w-[100px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">По:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            dateFormat="dd-MM-yyyy"
                            className="border p-1 rounded-md w-[100px]"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-around mt-2">
                    <button
                        className="p-2 border bg-white border-gray-300 rounded-md text-sm hover:bg-gray-100"
                        onClick={handleSearch}
                    >
                        Применить фильтр
                    </button>
                    <button
                        className="p-2 border bg-white border-gray-300 rounded-md text-sm hover:bg-gray-100"
                        onClick={onClearSearch}
                    >
                        Очистить фильтр
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteFilterPopover;