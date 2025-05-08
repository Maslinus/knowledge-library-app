import React, { useState } from "react"
import SearchBar from "./SearchBar/SearchBar"
import NoteFilterPopover from "./SearchBar/NoteFilterPopover"
import ProfileInfo from "./Cards/ProfileInfo"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  signInSuccess,
  signoutFailure,
  signoutStart,
} from "../redux/user/userSlice"
import axios from "axios"
import { toast } from "react-toastify"
import { MdViewList, MdViewModule } from "react-icons/md"

const Navbar = ({userInfo, tags, onSearchNote, handleClearSearch, viewMode, setViewMode}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSearch = () => {
    onSearchNote(searchQuery, selectedTags, startDate, endDate);
    
  }
  
  const onClearSearch = () => {
    setSearchQuery("")
    setSelectedTags([])
    setStartDate(null);
    setEndDate(null);
    handleClearSearch()
  }

  const handleTagsChange = (newTags) => {
    setSelectedTags(newTags);
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart())
  
        const res = await axios.get("http://localhost:3000/api/auth/signout", {
        withCredentials: true,
      })
  
      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message))
        toast.error(res.data.message)
        return
      }

      toast.success(res.data.message)
      dispatch(signInSuccess())
      navigate("/login")
    } catch (error) {
      toast.error(error.message)
      dispatch(signoutFailure(error.message))
    }
  }

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'>
      <Link to={"/"}>
          <h2 className='text-xl font-medium text-black py-2'>
              <span className='text-blue-400'>PI</span>
              <span className='text-slate-900'>Vault</span>
          </h2>
      </Link>
      <div className="flex items-center gap-2">
        <NoteFilterPopover
          tags={tags}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange} 
          handleSearch={handleSearch}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          onClearSearch = {onClearSearch}
        />
        <SearchBar
          value={searchQuery} 
          onChange={({target}) => setSearchQuery(target.value)}
          handleSearch = {handleSearch}
          onClearSearch = {onClearSearch}
        />
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="h-6 w-6  text-black hover:text-slate-700"
        >
          {viewMode === 'grid' ? <MdViewList className='h-full w-full'/> : <MdViewModule className='h-full w-full'/>}
        </button>
      </div>

      <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
    </div>
  )
}

export default Navbar