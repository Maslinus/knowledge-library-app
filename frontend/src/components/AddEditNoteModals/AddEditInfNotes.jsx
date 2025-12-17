import React, { useEffect, useRef, useState } from 'react';
import { MdAccountTree, MdAudioFile, MdCameraAlt, MdClose, MdCreate, MdDescription, MdGraphicEq, MdImage, MdLink, MdMic, MdSave, MdStop, MdTextFields, MdUpdate } from 'react-icons/md';
import TagInput from '../Input/TagInput';
import axios from 'axios';
import { toast } from "react-toastify";
import BlockInput from '../Input/BlockInput';
import { FaRegEye } from 'react-icons/fa6';
import NoteLinkModal from './NoteLinkModal';
import TreeModal from '../NotesTree/TreeModal';
import VersionList from './VersionList';

const AddEditInfNotes = ({ onClose, onChangeNote, noteData, type, getAllNotes, allNotes, history, currentHistoryIndex, jumpTo}) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [description, setDescription] = useState(noteData?.description || "");
  const [blocks, setBlocks] = useState(noteData?.blocks || [])
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(type !== "view");

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTitle(noteData?.title || "");
    setDescription(noteData?.description || "");
    setBlocks(noteData?.blocks || []);
    setTags(noteData?.tags || []);
    setIsEditing(type !== "view");
  }, [noteData]);

  const uploadToServer = async (file, resourceType = 'auto') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resource_type', resourceType);
    
      const response = await axios.post(`${API_URL}/uploadCloud/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
    
      if (response.data.success) {
        return {
          url: response.data.url,
          public_id: response.data.public_id,
          name: response.data.name,
        };
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file to server');
    }
  };
  
  const addEditNote = async () => {
    try {
      const updatedBlocks = [];
  
      for (const block of blocks) {
        if (block.file) {
          const resourceType = {
            image: 'image',
            audio: 'video',
            document: 'raw',
          }[block.type] || 'auto';
      
          const { url, public_id } = await uploadToServer(block.file, resourceType);
      
          updatedBlocks.push({
            type: block.type,
            url,
            public_id,
            name: block.file.name,
            size: block.file.size,
            fileType: block.file.type,
          });
        } else {
          updatedBlocks.push(block);
        }
      }
      
      const dataToSend = {
        title,
        description,
        blocks: updatedBlocks,
        tags,
      };
  
      const url = (type === 'edit' || type === 'view')
        ? `${API_URL}/infNote/edit/${noteData._id}`
        : `${API_URL}/infNote/add`;
  
      const res = (type === 'edit' || type === 'view')
        ? await axios.put(url, dataToSend, { withCredentials: true })
        : await axios.post(url, dataToSend, { withCredentials: true });
  
      if (!res.data.success) {
        setError(res.data.message);
        toast.error(res.data.message);
        return;
      }
  
      toast.success(res.data.message);
      getAllNotes();
      if((type === 'edit' || type === 'view')){
        setIsEditing(false);
      }else{
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    }
  };
  
  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title")
      return
    }

    if (!description) {
      setError("Please enter the description")
      return
    }

    if (!blocks) {
      setError("Please add the blocks")
      return
    }
  
    setError("")
    addEditNote()
  }

  const [showLinkModal, setShowLinkModal] = useState(false);

  const addBlock = async (type, content) => {
    if (type === 'text') {
        const newTextBlock = {
          type: 'text',
          text: 'Новый текстовый блок',
        };
        setBlocks((prev) => [...prev, newTextBlock]);
        return;
    }

    if (content) {
      const newBlock = {
        type,
        ...content,
      };
      setBlocks((prev) => [...prev, newBlock]);
      return;
    }

    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = {
      image: 'image/*',
      audio: 'audio/*',
      document: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx',
    }[type] || '*';
  
    fileInput.click();
  
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;
  
      const url = URL.createObjectURL(file);

      const newBlock = { type, file, url, name: file.name,
        size: file.size,
        fileType: file.type, };
      setBlocks((prev) => [...prev, newBlock]);
    };
  };

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleRecordAudio = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
  
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
  
      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
  
        addBlock('audio', {
          url: audioUrl,
          name: 'recording.webm',
          size: audioBlob.size,
          fileType: 'audio/webm',
        });
  
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
    }
  };

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
    }
  };
  
  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
  
    addBlock('image', {
      url: imageData,
      name: 'snapshot.png',
      size: 0,
      fileType: 'image/png',
    });
  
    stream.getTracks().forEach((track) => track.stop());
    setIsCameraOpen(false);
    setStream(null);
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const [showTreeModal, setShowTreeModal] = useState(false); 

  const handleOpenNoteModal = (noteId) => {
    const targetNote = allNotes.find(n => n._id === noteId);
    if (targetNote) {
      onChangeNote(targetNote);
    } else {
    toast.error("Не удалось загрузить заметку");
    }
  };
  
  const handleLoadVersion = (version) => {
    setTitle(version.title);
    setDescription(version.description);
    setBlocks(version.blocks);
    setTags(version.tags || []);
  };

  const handleLoadMainNote = () => {
    handleLoadVersion({
      title: noteData?.title,
      description: noteData?.description,
      blocks: noteData?.blocks,
      tags: noteData?.tags,
    });
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center z-50"
    >
      <div className='flex flex-col justify-between py-[1%] px-[1%]'>
        <div className="flex-col">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center top-2 right-10 bg-blue-500 text-white hover:bg-blue-800"
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

        {isEditing && (
          <div className="flex flex-col gap-2">
            {(type === "edit" || type === "view") && (
              <>
                <VersionList
                  key={noteData._id}
                  noteId={noteData._id}
                  title={title}
                  description={description}
                  blocks={blocks}
                  tags={tags}
                  onSelectVersion={handleLoadVersion}
                  handleLoadMainNote={handleLoadMainNote}
                />
              </>
            )}
            <div className="flex flex-col w-10 h-22 gap-2">
              <button
                className={`duration-700 w-10 h-10 rounded-full flex items-center justify-center transform
                  ${isRecording ? ' bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-red-500 hover:bg-red-700'}
                `}
                onClick={handleRecordAudio}
                title={isRecording ? 'Остановить запись' : 'Начать запись'}
              >
                {isRecording ? <MdStop className="text-xl text-white" /> : <MdMic className="text-xl text-white" />}
              </button>

              {isRecording && (
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 hover:bg-gray-400"
                  onClick={() => {
                    if (mediaRecorderRef.current) {
                      mediaRecorderRef.current.onstop = null;
                      mediaRecorderRef.current.stop();
                    }
                    mediaRecorderRef.current?.stop();
                    streamRef.current?.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                    setIsRecording(false);
                  }}
                  title="Отменить"
                >
                  <MdClose className="text-xl text-black" />
                </button>
              )}
            </div>

            <button
              className="mb-36 w-10 h-10 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-700"
              onClick={openCamera}
              title="открыть камеру"
            >
              <MdCameraAlt className="text-xl text-white" />
            </button>
          </div>
        )}
      </div>

      <div
        className="bg-white rounded-lg w-[80%]  h-full overflow-hidden"
      >
        <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
          <div className='flex justify-between items-center w-full'>
            <div className="flex items-center gap-2 p-2 w-[95%]">
              {!isEditing && (<>
                {history?.length > 0 && (
                  <div className="overflow-x-auto whitespace-nowrap no-scrollbar">
                    <div className="inline-flex items-center rounded">
                      {history.map((entry, index) => (
                        <div key={index} className="flex items-center">
                          <button
                            onClick={() => jumpTo(index)}
                            className={`px-3 rounded border ${
                              index === currentHistoryIndex
                                ? 'bg-blue-100 text-blue-800 font-semibold border-blue-300'
                                : 'bg-white text-blue-600 hover:bg-blue-50 border-slate-300'
                            }`}
                            title={index === currentHistoryIndex
                              ?"Текущая заметка":`Перейти к заметке ${entry.title}`}
                          >
                            {entry.title || entry.noteId}
                          </button>
                          {index < history.length - 1 && (
                            <span className="mx-2 text-slate-400">{'>'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>)}
            </div>

            <div className='flex items-center justify-center w-[5%]'>
            {!isEditing && <button
              className=" w-full h-full rounded bg-white text-blue-600 hover:bg-blue-50 border-slate-300 flex items-center justify-center"
              onClick={() => setShowTreeModal(true)}
              title="Показать дерево"
            >
              <MdAccountTree className="text-xl" />
            </button>}
            </div>
          </div>

          <div className='flex items-center gap-1 justify-between w-full px-2'>
            <div className='flex items-center gap-2 w-[70%] px-2'>
            {isEditing ? (
              <input
                  type="text"
                  className="border text-xl font-semibold text-slate-900 outline-none w-full"
                  placeholder="Title..."
                  value={title}
                  onChange={({ target }) => setTitle(target.value)}
              />
            ) : (
              <h2 className="text-2xl font-semibold text-slate-950 truncate" title={title}>
                {title}
              </h2>
            )}
            {isEditing ? (
              <input
                  type="text"
                  className="border text-xl font-semibold text-slate-900 outline-none w-full"
                  placeholder="description..."
                  value={description}
                  onChange={({ target }) => setDescription(target.value)}
              />
            ) : (
              <h2 className="text-sm max-w-70 font-semibold text-blue-900 truncate" title={description}>
              {description}
              </h2>
            )}
            </div>
            {!isEditing && <div><input
              type="text"
              className="w-full bg-slate-100 border-t border-x p-2 rounded-t-md"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            /></div>}
          </div>

          <div className=''>
            <BlockInput
              blocks={blocks}
              setBlocks={setBlocks}
              isEditing={isEditing}
              searchQuery={searchQuery}
              onSelectNote={handleOpenNoteModal}
            />
          </div>

          <div className="note-tags text-sm text-slate-500 p-2">
            {error && <p className="text-red-500 text-xs pt-4">{error}</p>}
            <div className="">
              <TagInput tags={tags} setTags={setTags} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between h-full py-[1%] px-[1%]">
        <div className="flex justify-end">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center top-2 right-10 bg-red-500 hover:bg-red-700"
            onClick={onClose}
            title='закрыть'
          >
            <MdClose className="text-xl text-slate-50"/>
          </button>
        </div>
        {isEditing && (
          <div className="flex flex-col gap-2">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-700"
              onClick={() => addBlock('text')}
              title="добавить текст"
            >
              <MdTextFields className="text-xl text-white" />
            </button>

            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-700"
              onClick={() => addBlock('audio')}
              title="добавить аудио"
            >
              <MdAudioFile  className="text-xl text-white" />
            </button>

            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 hover:bg-purple-700"
              onClick={() => addBlock('image')}
              title="добавить картинку"
            >
              <MdImage className="text-xl text-white" />
            </button>

            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-700"
              onClick={() => addBlock('document')}
              title="добавить документ"
            >
              <MdDescription className="text-xl text-white" />
            </button>

            <button
              className="mb-12 w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-700"
              onClick={() => setShowLinkModal(true)}
              title="добавить ссылку"
            >
              <MdLink className="text-xl text-white" />
            </button>
          </div>
        )}
        {showLinkModal && (
          <NoteLinkModal
            onClose={() => setShowLinkModal(false)}
            excludeId={noteData?._id}
            onSelect={(note) => {
                const newBlock = {
                    type: 'noteLink',
                    noteId: note._id,
                    noteTitle: note.title,
                };
                setBlocks([...blocks, newBlock]);
            }}
            notes={allNotes}
          />
        )}
        {showTreeModal && (
          <TreeModal
            onClose={() => setShowTreeModal(false)}
            allNotes={allNotes}
            rootNoteId={noteData?._id}
            onSelectNote={handleOpenNoteModal}
          />
        )}

        {isCameraOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className="mt-2 p-2 border rounded-lg bg-gray-100 flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-sm rounded shadow"
              />
              <div className='mt-2 flex justify-between w-full'>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-700"
                  onClick={handleTakePhoto}
                  title="Сделать снимок"
                >
                  <MdCameraAlt className="text-xl text-white" />
                </button>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-700 text-white"
                  onClick={() => {
                    stream?.getTracks().forEach((track) => track.stop());
                    setIsCameraOpen(false);
                    setStream(null);
                  }}
                  title="Отмена"
                >
                  <MdClose/>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEditInfNotes;