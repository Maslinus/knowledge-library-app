import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { RiDraftLine } from "react-icons/ri";
import { MdArticle, MdDelete, MdOutlineChangeCircle, MdSave } from "react-icons/md";

const VersionList = ({ noteId, title, description, blocks, tags, onSelectVersion, handleLoadMainNote }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  const fetchVersions = async () => {
    try {
      const res = await axios.get(`${API_URL}/versions/${noteId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setVersions(res.data.versions);
      }

    } catch (error) {
      console.error("Ошибка при получении версий:", error);
    }
  };
  
  const handleSaveVersion = async () => {
    try {
      const res = await axios.post(
          `${API_URL}/versions/save/${noteId}`,
          {
            title,
            description,
            blocks,
            tags,
          },
          { withCredentials: true }
        );
      if (res.data.success) {
          toast.success("Версия заметки сохранена");
        fetchVersions();
      } else {
        toast.error(res.data.message || "Не удалось сохранить версию");
      }
    } catch (error) {
      console.error("Ошибка при сохранении версии:", error);
      toast.error("Ошибка при сохранении версии");
    }
  };

  const handleUpdateVersion = async () => {
      try {
        const res = await axios.put(
          `${API_URL}/versions/update/${selectedVersionId}`,
          {
            title,
            description,
            blocks,
            tags,
          },
          { withCredentials: true }
        );
    
        if (res.data.success) {
          toast.success("Версия успешно обновлена");
          fetchVersions();
        } else {
          toast.error(res.data.message || "Ошибка при обновлении версии");
        }
      } catch (error) {
        console.error("Ошибка при обновлении версии:", error);
        toast.error("Ошибка при обновлении версии");
      }
  };      

  const handleDeleteVersion = async () => {
      if (!selectedVersionId) return;
    
      try {
        const res = await axios.delete(
          `${API_URL}/versions/delete/${selectedVersionId}`,
          { withCredentials: true }
        );
    
        if (res.data.success) {
          toast.success("Версия успешно удалена");
          setSelectedVersionId(null);
          fetchVersions();
        } else {
          toast.error(res.data.message || "Ошибка при удалении версии");
        }
      } catch (error) {
        console.error("Ошибка при удалении версии:", error);
        toast.error("Ошибка при удалении версии");
      }
  };
      
  useEffect(() => {
      if (noteId) {
      fetchVersions();
      }
  }, [noteId]);

  return (
    <div className="flex flex-col items-center">
        <button
            className="mb-3 w-10 h-10 rounded flex items-center justify-center top-2 right-10 bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => {
                handleLoadMainNote();
                setSelectedVersionId(null);
              }}
            title="Основная ветка"
            >
            <MdArticle/>
        </button>
        <div className="max-h-40 overflow-y-auto rounded-t  bg-slate-800 no-scrollbar">
        {versions.map((version) => (
          <div key={version._id} className="relative flex flex-col items-center">
            {selectedVersionId === version._id && (
              <div className="mt-1 w-8 h-16 flex flex-col rounded-t overflow-hidden">
                <button
                  className=" w-full h-8 flex items-center justify-center text-xs bg-teal-600 text-white hover:bg-teal-700"
                  onClick={handleUpdateVersion}
                  title="Обновить версию"
                >
                  <MdOutlineChangeCircle className="w-7 h-7"/>
                </button>
                <button
                  className="w-full h-8 flex items-center justify-center text-xs bg-rose-500 text-white hover:bg-rose-600"
                  onClick={() => handleDeleteVersion(version._id)}
                  title="Удалить версию"
                >
                  <MdDelete className="w-7 h-7"/>
                </button>
              </div>
            )}
            <button
              title={format(new Date(version.createdAt), "dd.MM.yyyy HH:mm")}
              className={`w-8 flex items-center justify-center text-white ${
                selectedVersionId === version._id
                  ? "h-4 bg-amber-500 rounded-b mx-1 mb-1"
                  : "h-8 bg-slate-700 hover:bg-slate-300 rounded m-1"
              }`}
              onClick={() => {
                setSelectedVersionId(version._id);
                onSelectVersion(version);
              }}
            >
                <RiDraftLine />
            </button>
          </div>
        ))}
        </div>
        <button
            className="mb-3 w-10 h-10 rounded flex items-center justify-center top-2 right-10 bg-amber-500 text-white hover:bg-amber-700"
            onClick={handleSaveVersion}
            title="Сохранить версию"
            >
            <MdSave/>
        </button>
    </div>
  );
};

export default VersionList;
