import React, { useState } from 'react';
import { MdDelete, MdDragHandle} from 'react-icons/md';
import ScrollableWithShadow from '../../utils/ScrollableWithShadow';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { FaFile, FaFileExcel, FaFilePdf, FaFilePowerpoint, FaFileWord, FaFileArrowDown, FaRegCopy } from 'react-icons/fa6';

const BlockInput = ({ blocks, setBlocks, isEditing, searchQuery, onSelectNote}) => {

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    
    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;
      
        const updatedBlocks = [...blocks];
        const [movedBlock] = updatedBlocks.splice(draggedIndex, 1);
        updatedBlocks.splice(index, 0, movedBlock);
      
        setBlocks(updatedBlocks);
        setDraggedIndex(null);
        setIsDraggingEnabled(false);
    };

    const handleTextBlockChange = (index, newText) => {
        const updatedBlocks = blocks.map((block, i) =>
        i === index ? { ...block, text: newText } : block
        );
        setBlocks(updatedBlocks);
    };

    const removeBlock = (indexToRemove) => {
        const confirmed = window.confirm("Удалить этот блок?");
        if (confirmed) {
            setBlocks(prev => prev.filter((_, i) => i !== indexToRemove));
        }
    };

    const getYouTubeVideoId = (url) => {
        try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('youtu.be')) {
            return parsedUrl.pathname.slice(1);
        }
        if (parsedUrl.hostname.includes('youtube.com')) {
            return parsedUrl.searchParams.get('v');
        }
        } catch {
        return null;
        }
        return null;
    };

    const highlightText = (text, query) => {
        if (!query) return [<span key="0">{text}</span>];
    
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.split(regex).map((part, i) =>
        regex.test(part)
            ? <span key={`highlight-${i}`} className="bg-yellow-200">{part}</span>
            : <span key={`normal-${i}`}>{part}</span>
        );
    };

    const getFileIconByMimeType = (mimeType = '') => {
        if (mimeType === 'application/pdf') return <FaFilePdf className="text-red-600 text-2xl" />;
        if (mimeType.includes('wordprocessingml.document')) return <FaFileWord className="text-blue-600 text-2xl" />;
        if (mimeType.includes('presentationml.presentation')) return <FaFilePowerpoint className="text-orange-500 text-2xl" />;
        if (mimeType.includes('spreadsheetml.sheet')) return <FaFileExcel className="text-green-600 text-2xl" />;
        if (mimeType.includes('zip')) return <FaFileArchive className="text-gray-500 text-2xl" />;
        return <FaFile className="text-gray-400 text-2xl" />;
    };
      
  return (
    <>
        <ScrollableWithShadow height={isEditing ? '85vh'  : '81vh'} className={`overflow-y-auto h-full rounded-md bg-slate-100 ${
                isEditing ? 'border-slate-300 border' : ''} shadow-md scroll-smooth`}>
            {blocks.map((block, index) => (
            <div 
                key={index}
                className={`mb-1 flex items-center justify-between px-2 ${!isEditing && 'border-b'}`}
                draggable={isDraggingEnabled && draggedIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setIsDraggingEnabled(false);
                  setDraggedIndex(null);
                }}
            >
                {block.type === 'text' && (isEditing ? (
                        <>
                            <textarea
                                ref={(el) => {
                                    if (el && el.dataset.initialized !== "true") {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                        el.dataset.initialized = "true";
                                        el.style.overflowY = 'auto';
                                    }
                                }}
                                className="w-full p-2 border rounded resize-none leading-relaxed"
                                style={{ overflowY: 'auto' }}
                                value={block.text}
                                onChange={(e) => handleTextBlockChange(index, e.target.value)}
                            />
                        </>
                    ) : (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap break-words w-full">
                        {block.text.split(/(```[\s\S]*?```)/g).map((chunk, i) => {
                            if (chunk.startsWith('```') && chunk.endsWith('```')) {
                                const lines = chunk.slice(3, -3).trim().split('\n');
                                const firstLine = lines[0].trim();
                                const langMatch = firstLine.match(/^[a-zA-Z]+$/);
                                const language = langMatch ? firstLine : 'javascript';
                                const code = langMatch ? lines.slice(1).join('\n') : lines.join('\n');

                                return (
                                    <div key={i} className="my-1">
                                        <div className="h-1 bg-blue-500 rounded-t-sm" />
                                        <div className="bg-blue-50 px-3 py-2">
                                            <SyntaxHighlighter
                                                language={language}
                                                style={oneLight}
                                                customStyle={{
                                                    background: 'transparent',
                                                    padding: '0',
                                                    margin: '0',
                                                    fontSize: '0.875rem',
                                                    lineHeight: '1.4',
                                                }}
                                                codeTagProps={{
                                                    style: {
                                                        backgroundColor: 'transparent',
                                                        display: 'block',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                    },
                                                }}
                                                >
                                                {code}
                                            </SyntaxHighlighter>
                                        </div>
                                        <div className="h-1 bg-blue-500 rounded-b-sm" />
                                    </div>
                                );
                            }

                            return chunk.split(/(https?:\/\/[^\s]+)/g).map((part, j) => {
                                if (/https?:\/\/[^\s]+/.test(part)) {
                                  const videoId = getYouTubeVideoId(part);
                              
                                  return (
                                    <React.Fragment key={`${i}-${j}`}>
                                      <a
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline break-all"
                                      >
                                        {part}
                                      </a>
                              
                                      {videoId && (
                                        <div className="my-2">
                                          <a
                                            href={`https://youtube.com/watch?v=${videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block max-w-md rounded-md overflow-hidden shadow hover:shadow-md transition"
                                          >
                                            <div className="flex gap-3 items-start bg-gray-100 p-2">
                                              <img
                                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                alt="YouTube thumbnail"
                                                className="w-28 h-20 object-cover rounded"
                                              />
                                              <div className="text-xs text-slate-800">
                                                <p className="font-semibold">YouTube Видео</p>
                                                <p className="text-gray-500 text-[0.7rem] break-all">
                                                  youtube.com/watch?v={videoId}
                                                </p>
                                              </div>
                                            </div>
                                          </a>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                }
                                return (
                                    <span key={`${i}-${j}`}>
                                        {highlightText(part, searchQuery)}
                                    </span>
                                );
                            }); 
                        })}
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigator.clipboard.writeText(block.text)}
                                className="flex items-center gap-1 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-gray-300 transition"
                                title='Копировать'
                            >
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>)
                )}

                {block.type === 'image' && (
                    <>
                    <img src={block.url} alt="Note content" className="rounded-md w-[30%] object-contain mb-2" />
                    </>
                )}

                {block.type === 'audio' && (
                    <>
                    <audio controls className="w-full">
                        <source src={block.url} type="audio/mpeg" />
                        Ваш браузер не поддерживает аудио.
                    </audio>
                    </>
                )}

                {block.type === 'document' && (
                    <div className="w-full p-2 border rounded shadow-sm bg-white flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">{getFileIconByMimeType(block.fileType)}</div>
                            <div>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium text-gray-800">
                                {block.name || 'Документ'}
                                </p>
                                <p className="text-sm text-gray-500">
                                {(block.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            </div>
                        </div>
                        {!isEditing && (
                            <div className="flex gap-4">
                                <a
                                    href={block.url}
                                    download={block.name || `${block.url.split('/').pop().split('?')[0]}`}
                                    title="Скачать документ"
                                    className="w-8 h-8 bg-gray-200 text-gray-800 flex items-center justify-center rounded hover:bg-gray-300 transition"
                                >
                                    <FaFileArrowDown size={20} />
                                </a>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {block.type === 'noteLink' && ( isEditing ? (
                        <>
                        <div className="w-full p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                            <div
                                className="text-blue-600 underline"
                            >
                                Переход к заметке: {block.noteTitle || block.noteId}
                            </div>
                        </div>
                        </>
                    ):(
                        <>
                        <div className="w-full p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                            <button
                                onClick={() => onSelectNote(block.noteId)}
                                className="text-blue-600 underline"
                            >
                                Перейти к заметке: {block.noteTitle || block.noteId}
                            </button>
                        </div>
                        </>
                    )
                )}

                {isEditing && (
                    <div className="flex flex-col items-center justify-between mt-2 mb-2">
                        <MdDelete
                            className="icon-btn hover:text-red-500 cursor-pointer"
                            onClick={() => removeBlock(index)}
                        />
                        <MdDragHandle
                            className="text-xl text-gray-400 cursor-move hover:text-gray-600"
                            title="Перетащить"
                            onMouseDown={() => {
                                setIsDraggingEnabled(true);
                                setDraggedIndex(index);
                            }}
                            onMouseUp={() => setIsDraggingEnabled(false)}
                            onMouseLeave={() => setIsDraggingEnabled(false)}
                        />
                    </div>
                )}
            </div>
        ))}
        </ScrollableWithShadow>
        </>
    );
};

export default BlockInput;