import React from 'react'
import {MdCreate, MdDelete, MdOutlinePushPin} from "react-icons/md"
import moment from "moment"

const NoteCard = ({ title, date, content, tags, isPinned, onPinNote, onEdit, onDelete, onView }) => {
  return (
    <div className="border rounded-lg bg-slate-200 hover:shadow-xl transition-all ease-in-out flex items-center justify-between">
        <div className="rounded-lg px-4 py-2 w-[80%]" onClick = {onView}>
            <div className="flex items-center justify-between">
                <div className='w-full'>
                    <h6 className="text-sm font-medium break-words overflow-hidden max-w-full truncate" title={title}>{title}</h6>
                    <span className="text-xs text-green-700">
                        {moment(date, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("Do MMM YYYY")}
                    </span>
                </div>
            </div>  
            <p className="text-xs text-slate-600 mt-2 break-words overflow-hidden max-w-full truncate">
                {content?.slice(0, 60)}
            </p>
            <div className="flex items-center justify-between mt-2">
                <div
                    className="text-xs text-slate-500 break-words overflow-hidden truncate max-w-full"
                    title={tags.map((tag) => `#${tag}`).join(" ")}
                >
                    {tags.map((tag, i) => (
                    <span key={i} className="mr-1">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
        <div className="rounded-lg p-4 flex flex-col justify-between w-[20%] h-full items-center space-y-4">
            <MdOutlinePushPin
                className={`icon-btn ${
                    isPinned ? "text-[#2B85FF] " : "text-slate-300"
                }`}
                onClick={onPinNote}
            />
            <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
            />

            <MdDelete
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
            />
        </div>
    </div>
    )
}

export default NoteCard