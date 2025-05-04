import { useState, useRef } from 'react';
import { BsColumns, BsColumnsGap } from "react-icons/bs";
import { MdCreate, MdDelete } from 'react-icons/md';

const GroupDropdown = ({ groups = [], onAddGroup, onDeleteGroup, onEditGroup, onGroupClick, activeGroupId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
        {isOpen ? (
            <button className="h-6 w-6" onClick={handleToggle}>
                <BsColumnsGap className="h-full w-full" title="Группы" />
            </button>):(
            <button className="h-6 w-6" onClick={handleToggle}>
                <BsColumns className="h-full w-full" title="Группы" />
            </button>
        )}
        {isOpen && (
            <div className="absolute right-0 w-[300px] sm:w-[400px] md:w-[500px] bg-white border border-gray-300 rounded-lg shadow-2xl p-2">
            <h3 className="text-sm font-semibold mb-2">Группы</h3>

            {groups.length > 0 ? (
                <ul className="text-sm max-h-40 overflow-y-auto space-y-1">
                {groups.map(group => (
                    <div
                        key={group._id}
                        className={`border-b last:border-0 flex justify-between items-center rounded cursor-pointer ${
                            activeGroupId === group._id ? "bg-slate-100" : ""
                        }`}
                    >
                        <div 
                            className="flex items-center w-[85%]" 
                            onClick={() => onGroupClick && onGroupClick(group._id)}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: group.color || "#000" }}
                                title='Цвет группы'
                            ></div>
                            <div title={group.title} className='break-words truncate'>
                                {group.title}
                            </div>
                        </div>
                        <div className='flex items-center w-[15%] justify-between'>
                            <MdCreate
                                className="icon-btn hover:text-green-600 flex-shrink-0"
                                onClick={() => {
                                    onEditGroup(group);
                                    handleToggle()
                                }}
                                title="Редактировать группу"
                            />
                            <MdDelete
                                className="icon-btn hover:text-red-500 flex-shrink-0"
                                onClick={() => onDeleteGroup(group._id)}
                                title="Удалить группу"
                            />
                        </div>
                    </div>
                ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-sm">Нет групп...</p>
            )}

            <button
                onClick={() => {
                    onAddGroup();
                    handleToggle()
                }}
                className="mt-3 w-full bg-blue-500 text-white text-sm py-1 rounded hover:bg-blue-600"
            >
                Создать группу
            </button>
            </div>
        )}
        </div>
    );
};

export default GroupDropdown;