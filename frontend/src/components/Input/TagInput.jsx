import React, { useState } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'

const TagInput = ({ tags, setTags, isEditing }) => {
    const [inputValue, setInputValue] = useState("")

    const handleInputChange = (e) => {
        setInputValue(e.target.value)
    }

    const addNewTag = () => {
        if (inputValue.trim() !== "") {
          setTags([...tags, inputValue.trim()])
          setInputValue("")
        }
    }
    
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          addNewTag()
        }
    }

    const handleRemoveTag = (tagToRemove) =>{
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

  return (
        <div
            className={`flex justify-between items-center gap-2 ${
                isEditing ? 'border-slate-300 border p-1 rounded bg-slate-100' : ''}`}
        >
            {tags?.length > 0 ? (
            <div className="overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className='inline-flex items-center gap-2'>
                {tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className={`flex items-center gap-2 text-sm text-slate-900 ${isEditing ? 'bg-white' : 'bg-slate-200'} px-3 py-1 rounded`}
                        >
                            # {tag}

                            <button
                                onClick={() => {
                                handleRemoveTag(tag)
                                }}
                            >
                                {isEditing && <MdClose />}
                            </button>
                        </span>
                    ))
                }
            </div>
            </div>
        ):(<p>Тегов нет...</p>)}

        {isEditing && (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={inputValue}
                className="bg-white text-sm bg-transparent border px-3 py-1 rounded outline-none"
                placeholder="Add Tags"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />

            <button
                className="w-6 h-6 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700"
                onClick={() => {
                    addNewTag()
                }}
                title='Добавить'
            >
                <MdAdd className="text-2xl text-blue-700 hover:text-white" />
            </button>
        </div>
        )}
    </div>
  )
}

export default TagInput