import React, { useState } from 'react'
import { MdClose, MdCreate, MdSave, MdUpdate } from 'react-icons/md'
import TagInput from '../../components/Input/TagInput'
import axios from 'axios'
import { toast } from "react-toastify"
import { FaRegEye } from 'react-icons/fa6'
import ScrollableWithShadow from '../../utils/ScrollableWithShadow'

const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
    const [title, setTitle] = useState(noteData?.title || "")
    const [content, setContent] = useState(noteData?.content || "")
    const [tags, setTags] = useState(noteData?.tags || [])
    const [error, setError] = useState(null)
    const [isEditing, setIsEditing] = useState(type !== "view");

    const editNote = async () => {
        const noteId = noteData._id
    
        try {
            const res = await axios.post(
            "http://localhost:3000/api/note/edit/" + noteId,
            { title, content, tags },
            { withCredentials: true }
            )
            
            if (res.data.success === false) {
                console.log(res.data.message)
                setError(res.data.message)
                toast.error(res.data.message)
                return
            }
    
            toast.success(res.data.message)
            getAllNotes()
            setIsEditing(false);
            // onClose()
        } catch (error) {
          toast.error(error.message)
          console.log(error.message)
          setError(error.message)
        }
    }

    const addNewNote = async () => {
        try {
            const res = await axios.post(
            "http://localhost:3000/api/note/add",
            { title, content, tags },
            { withCredentials: true }
            )
    
            if (res.data.success === false) {
                console.log(res.data.message)
                setError(res.data.message)
                toast.error(res.data.message)
    
                return
            }
    
            toast.success(res.data.message)
            getAllNotes()
            onClose()
        } catch (error) {
            toast.error(error.message)
            console.log(error.message)
            setError(error.message)
        }
    }

    const handleAddNote = () => {
        if (!title) {
          setError("Please enter the title")
          return
        }
    
        if (!content) {
          setError("Please enter the content")
          return
        }
    
        setError("")
    
        if ((type === 'edit' || type === 'view')) {
          editNote()
        } else {
          addNewNote()
        }
    }

    return (
        <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center z-50"
        >
            <div className='py-[1%] px-[1%]'>
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center top-2 right-10 bg-blue-500 hover:bg-blue-800"
                    onClick={() => setIsEditing(!isEditing)}
                    title={isEditing ? 'просмотр' : 'редактирование'}
                    >
                    {isEditing ? <FaRegEye/> : <MdCreate/>}
                </button>
                {isEditing && (
                <button
                    className="mt-2 w-10 h-10 rounded-full flex items-center justify-center top-2 right-10 bg-teal-500 text-white hover:bg-teal-700"
                    onClick={handleAddNote}
                    title={(type === "edit" || type === "view") ? "Обновить" : "Сохранить"}
                >
                    {(type === "edit" || type === "view") ? <MdUpdate/> : <MdSave/>}
                </button>
                )}
            </div>
            <div
            className="bg-white rounded-lg w-[80%]  h-full overflow-hidden"
            >

            <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
            <ScrollableWithShadow className='overflow-y-auto h-full rounded-md bg-slate-100 shadow-md scroll-smooth' height='100vh'>
                <div className="flex flex-col gap-2 p-2">
                    {isEditing ? (
                        <input
                            type="text"
                            className="border-slate-300 border p-1 text-2xl text-slate-950 bg-slate-100 outline-none rounded"
                            placeholder="Wake up at 6 a.m."
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                        />
                    ) : (
                    <h2 className="text-2xl font-semibold text-slate-950">
                        {title}
                    </h2>
                    )}
                </div>
                <div className="flex flex-col gap-2 p-2">
                {isEditing ? (
                        <textarea
                            type="text"
                            className="border-slate-300 border text-sm text-slate-950 outline-none bg-slate-100 p-2 rounded"
                            placeholder="Content..."
                            rows={26}
                            value={content}
                            onChange={({ target }) => setContent(target.value)}
                        />
                    ) : (
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                            {content}
                        </pre>
                    )}
                </div>
                <div className="p-2">
                    <TagInput tags={tags} setTags={setTags} isEditing={isEditing}/>
                </div>

                {error && <p className="text-red-500 text-xs pt-4">{error}</p>}
                </ScrollableWithShadow>
            </div>
            </div>
            <div className='py-[1%] px-[1%]'>
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center top-2 right-10 bg-red-500 hover:bg-red-700"
                    onClick={onClose}
                    title='закрыть'
                >
                    <MdClose className="text-xl text-slate-50"/>
                </button>
            </div>
        </div>
    )
}

export default AddEditNotes