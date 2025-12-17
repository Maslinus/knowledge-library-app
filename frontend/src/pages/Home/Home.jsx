import React, { useEffect, useMemo, useState } from 'react'
import NoteCard from '../../components/Cards/NoteCard'
import InfNoteCard from '../../components/Cards/infNoteCard'
import Modal from "react-modal"
import AddEditNotes from '../../components/AddEditNoteModals/AddEditNotes'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axios from 'axios'
import { toast } from "react-toastify"
import EmptyCard from '../../components/EmptyCard/EmptyCard'
import AddEditInfNotes from '../../components/AddEditNoteModals/AddEditInfNotes'
import AddNoteButton from '../../components/AddEditNoteModals/AddNoteButton'
import ScrollableWithShadow from '../../utils/ScrollableWithShadow'
import GroupDropdown from '../../components/GroupDropdown/GroupDropdown'
import GroupModal from '../../components/GroupDropdown/GroupModal'
import { MdViewList, MdViewModule } from 'react-icons/md'
import { API_URL } from '../../api'

const Home = () => {
  // UserInfo
  const { currentUser, loading, errorDispatch } = useSelector(
    (state) => state.user
  );
  const [userInfo, setUserInfo] = useState(null);

  // InfNote
  const [allInfNotes, setAllInfNotes] = useState([]);
  const [showInfNotes, setShowInfNotes] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [tags, setTags] = useState([]);

  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const [openAddEditModalInf, setOpenAddEditModalInf] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const getAllInfNotes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/infNote/all", {
        withCredentials: true,
      })

      if (res.data.success === false) {
        console.log(res.data)
        return
      }

      const allTags = res.data.notes.flatMap(note => note.tags);
      const uniqueTags = [...new Set(allTags)];

      const sortedNotes = res.data.notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setAllInfNotes(sortedNotes)
      setTags(uniqueTags);
    } catch (error) {
      console.log(error)
    }
  }

  const deleteFromCloudinary = async (public_id, resource_type = 'image') => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/uploadCloud/delete",
        { public_id, resource_type },
        { withCredentials: true }
      );
      return response.data.success;
    } catch (error) {
      console.error("Ошибка при удалении файла из Cloudinary:", error);
    }
  };

  const deleteInfNote = async (data) => {
    const noteId = data._id

    try {
      if (Array.isArray(data.blocks)) {
        for (const block of data.blocks) {
          if (block?.public_id) {
            const resourceType = {
              image: 'image',
              audio: 'video',
              document: 'raw',
            }[block.type] || 'image';
              const deleted = await deleteFromCloudinary(block.public_id, resourceType);
            if (!deleted) {
              console.warn(`Файл с public_id ${block.public_id} не удалось удалить`);
            }
          }
        }
      }

      const res = await axios.delete(
        "http://localhost:3000/api/infNote/delete/" + noteId,
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        return
      }

      toast.success(res.data.message)
      getAllInfNotes()
    } catch (error) {
      toast(error.message)
    }
  }

  const handleInfNoteView = (newNote) => {
    if (currentHistoryIndex >= 0 && history[currentHistoryIndex]?.noteId === newNote._id) return;
  
    const newEntry = {
      noteId: newNote._id,
      title: newNote.title,
    };
  
    const updatedHistory = [...history.slice(0, currentHistoryIndex + 1), newEntry];
  
    setHistory(updatedHistory);
    setCurrentHistoryIndex(updatedHistory.length - 1);
  
    setOpenAddEditModalInf({
      isShown: true,
      type: "view",
      data: newNote,
    });
  };

  const handleInfEdit = (newNote) => {
    if (currentHistoryIndex >= 0 && history[currentHistoryIndex]?.noteId === newNote._id) return;
  
    const newEntry = {
      noteId: newNote._id,
      title: newNote.title,
    };
  
    const updatedHistory = [...history.slice(0, currentHistoryIndex + 1), newEntry];
  
    setHistory(updatedHistory);
    setCurrentHistoryIndex(updatedHistory.length - 1);
  
    setOpenAddEditModalInf({
      isShown: true,
      type: "edit",
      data: newNote,
    });
  };

  const updateInfIsPinned = async (noteData) => {
    const noteId = noteData._id;
  
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/infNote/update-note-pinned/${noteId}`,
        { isPinned: !noteData.isPinned },
        { withCredentials: true }
      );
  
      if (res.data.success === false) {
        toast.error(res.data.message);
        console.log(res.data.message);
        return;
      }
  
      toast.success(res.data.message);
      getAllInfNotes();
    } catch (error) {
      console.log(error.message);
      toast.error("Ошибка при обновлении закрепления");
    }
  };

  const jumpTo = async (index) => {
    const entry = history[index];
    if (!entry) return;
  
    try {
      const res = await axios.get(`http://localhost:3000/api/infNote/${entry.noteId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setCurrentHistoryIndex(index);
        setOpenAddEditModalInf({
          isShown: true,
          type: "view",
          data: res.data.note,
        });
      }
    } catch {
      toast.error('Не удалось загрузить заметку из истории');
    }
  };
  
  // Note
  const [allNotes, setAllNotes] = useState([]);
  const [showNotes, setShowNotes] = useState(true);
  const [isSearch, setIsSearch] = useState(false);
  
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  })

  const getAllNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/note/all`, {
        withCredentials: true,
      })

      if (res.data.success === false) {
        console.log(res.data)
        return
      }

      setAllNotes(res.data.notes)
    } catch (error) {
      console.log(error)
    }
  }

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" })
  }

  const handleNoteView = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "view" })
  }

  const deleteNote = async (data) => {
    const noteId = data._id

    try {
      const res = await axios.delete(
        `${API_URL}/note/delete/` + noteId,
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        return
      }

      toast.success(res.data.message)
      getAllNotes()
    } catch (error) {
      toast(error.message)
    }
  }

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id

    try {
      const res = await axios.put(
        `${API_URL}/note/update-note-pinned/` + noteId,
        { isPinned: !noteData.isPinned },
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        console.log(res.data.message)
        return
      }

      toast.success(res.data.message)
      getAllNotes()
    } catch (error) {
      console.log(error.message)
    }
  }

  // AllNotes
  const onSearchNote = async (query, selectedTags = [], startDate, endDate) => {
    const isQueryEmpty = !query || query.trim() === "";
    const noFilters = selectedTags.length === 0 && !startDate && !endDate;
  
    if (isQueryEmpty && noFilters) {
      handleClearSearch();
      return;
    }

    try {
      const [noteRes, infNoteRes] = await Promise.all([
        axios.get(`${API_URL}/note/search`, {
          params: { query, tags: selectedTags, startDate, endDate },
          withCredentials: true,
        }),
        axios.get(`${API_URL}/infNote/search`, {
          params: { query, tags: selectedTags, startDate, endDate },
          withCredentials: true,
        }),
      ]);
  
      if (noteRes.data.success === false) {
        console.log(noteRes.data.message);
        toast.error(noteRes.data.message);
        return;
      }
  
      if (infNoteRes.data.success === false) {
        console.log(infNoteRes.data.message);
        toast.error(infNoteRes.data.message);
        return;
      }
  
      setIsSearch(true);
      setAllNotes(noteRes.data.notes);
      setAllInfNotes(infNoteRes.data.notes);
  
    } catch (error) {
      toast.error("Поиск не удался: " + error.message);
    }
  };
  
  const handleClearSearch = () => {
    setIsSearch(false)
    getAllNotes()
    getAllInfNotes()
  }

  const navigate = useNavigate()

  // Group
  const [allGroups, setAllGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  
  const [openAddEditModalGroup, setOpenAddEditModalGroup] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const filteredInfNotes = useMemo(() => {
    if (!activeGroupId) return allInfNotes;
  
    const selectedGroup = allGroups.find((g) => g._id === activeGroupId);
    if (!selectedGroup) return allInfNotes;
  
    return allInfNotes.filter((note) =>
      selectedGroup.noteIds.includes(note._id)
    );
  }, [activeGroupId, allInfNotes, allGroups]);

  const getGroupColor = (groupId) => {
    const group = allGroups.find((g) => g._id === groupId);
    return group?.color || "#3b82f6";
  };

  const getAllGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/group/all`, {
        withCredentials: true,
      });
  
      if (res.data.success === false) {
        console.log(res.data);
        return;
      }
  
      setAllGroups(res.data.groups);
    } catch (error) {
      console.log("Ошибка при получении групп:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await axios.delete(`${API_URL}/group/delete/${groupId}`, {
        withCredentials: true,
      });
  
      if (res.data.success) {
        setAllGroups(prev => prev.filter(group => group._id !== groupId));
        toast.success("Группа удалена");
      } else {
        toast.error("Ошибка при удалении");
      }
    } catch (error) {
      toast.error("Не удалось удалить группу");
      console.error(error);
    }
  };

  const handleGroupEdit = (group) => {
    setOpenAddEditModalGroup({
      isShown: true,
      type: "edit",
      data: group,
    });
  };

  const handleGroupCreate = () => {
    setOpenAddEditModalGroup({
      isShown: true,
      type: "add",
      data: null,
    });
  };
  
  useEffect(() => {
    if (currentUser === null || !currentUser) {
      navigate("/login")
    } else {
      setUserInfo(currentUser?.rest)
      getAllNotes()
      getAllInfNotes()
      getAllGroups();
    }
  }, [])

  return (
    <>
      <ScrollableWithShadow className='relative  overflow-y-auto h-full rounded-md bg-slate-100 shadow-md scroll-smooth' height='100vh'>
      <Navbar userInfo={userInfo} tags={tags} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} viewMode={viewMode} setViewMode = {setViewMode}/>
      
      <div className="container max-w-[calc(100%-2rem)] mx-auto">
      {(Array.isArray(allNotes) && allNotes.length > 0) || (Array.isArray(allInfNotes) && allInfNotes.length > 0) ? (
          <>
            <button className='mt-3' onClick={() => setShowNotes((prev) => !prev)}>
              {showNotes ? "Скрыть заметки" : "Показать заметки"}
            </button>
            <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-1 max-md:m-5" 
                  : "flex flex-col gap-2 mt-1 max-md:m-5"}>
              {showNotes && Array.isArray(allNotes) && allNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  title={note.title}
                  date={note.createdAt}
                  content={note.content}
                  tags={note.tags}
                  isPinned={note.isPinned}
                  onEdit={() => {handleEdit(note)}}
                  onDelete={() => {deleteNote(note)}}
                  onPinNote={() => {updateIsPinned(note)}}
                  onView={() => handleNoteView(note)}
                  viewMode={viewMode}
                />
              ))}
            </div>

            <div className='flex justify-between items-center mt-3'>
              <button className='' onClick={() => setShowInfNotes((prev) => !prev)}>
                {showInfNotes ? "Скрыть инфозаметки" : "Показать инфозаметки"}
              </button>
              <GroupDropdown
                groups={allGroups}
                onAddGroup={handleGroupCreate}
                onEditGroup={handleGroupEdit}
                onDeleteGroup={handleDeleteGroup}
                onGroupClick={(groupId) => setActiveGroupId(prev => (prev === groupId ? null : groupId))}
                activeGroupId={activeGroupId}
              />
              <Modal
                isOpen={openAddEditModalGroup.isShown}
                onRequestClose={() => {}}
                style={{
                  overlay: {
                    backgroundColor: "rgba(0,0,0,0.2)",
                  },
                }}
                contentLabel=""
                className="w-[60%] h-full bg-white rounded-md mx-auto overflow-scroll"
              >
                <GroupModal
                  onClose={() => {
                    setOpenAddEditModalGroup({ isShown: false, type: "create", data: null });
                  }}
                  type={openAddEditModalGroup.type}
                  group={openAddEditModalGroup.data}
                  allNotes={allInfNotes}
                  getAllGroups={getAllGroups}
              />
              </Modal>
            </div>

            {showInfNotes &&
              <div
                className="rounded-md"
                style={{
                  border: activeGroupId ? `2px solid ${getGroupColor(activeGroupId)}` : "none",
                }}
              >
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1 max-md:m-5" 
                  : "flex flex-col gap-2 mt-1 max-md:m-5"}>
                  {Array.isArray(filteredInfNotes) && filteredInfNotes.map((note) => (
                    <InfNoteCard
                      key={note._id}
                      title={note.title}
                      date={note.createdAt}
                      upDate={note.updatedAt}
                      description={note.description}
                      tags={note.tags}
                      isPinned={note.isPinned}
                      onEdit={() => handleInfEdit(note)}
                      onDelete={() => deleteInfNote(note)}
                      onPinNote={() => updateInfIsPinned(note)}
                      onView={() => handleInfNoteView(note)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            }
          </>
        ) : (
          <EmptyCard
            imgSrc={
              isSearch
                ? "https://media.istockphoto.com/id/1011853308/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0-%D0%BD%D0%B5-%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%B0.jpg?s=612x612&w=0&k=20&c=ETT7L86QdlA8bBh26E1s33ozS79WXrGEbERAD5xv65s="
                : "https://media.istockphoto.com/id/1011853308/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0-%D0%BD%D0%B5-%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%B0.jpg?s=612x612&w=0&k=20&c=ETT7L86QdlA8bBh26E1s33ozS79WXrGEbERAD5xv65s="
            }
            message={
              isSearch
                ? "Упс! Заметок, соответствующих вашему поиску, не найдено"
                : `Готовы записывать свои идеи? Нажмите кнопку «Добавить», чтобы начать записывать свои мысли, вдохновение и напоминания. Давайте начнем!`
            }
          />
        )}
      </div>
      <div className='h-20'></div>

      <AddNoteButton   
        setOpenAddEditModal={setOpenAddEditModal} 
        setOpenAddEditModalInf={setOpenAddEditModalInf} 
        className="w-8 h-8 flex items-center justify-center rounded-2xl bg-[#2B85FF] hover:bg-blue-600 absolute right-10 bottom-10"
      >
      </AddNoteButton>
      </ScrollableWithShadow>

      <Modal
        isOpen={openAddEditModalInf.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[80%] h-full bg-white rounded-md mx-auto overflow-scroll"
      >
        <AddEditInfNotes
          onClose={() =>{
            setHistory([]);
            setCurrentHistoryIndex(-1);
            setOpenAddEditModalInf({ isShown: false, type: "add", data: null })
          }}
          onChangeNote={handleInfNoteView}
          noteData={openAddEditModalInf.data}
          type={openAddEditModalInf.type}
          getAllNotes={getAllInfNotes}
          allNotes={allInfNotes}
          history={history}
          currentHistoryIndex={currentHistoryIndex}
          jumpTo={jumpTo}
        />
      </Modal>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[80%] h-full bg-white rounded-md mx-auto overflow-scroll"
      >
        <AddEditNotes
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          noteData={openAddEditModal.data}
          type={openAddEditModal.type}
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  )
}

export default Home