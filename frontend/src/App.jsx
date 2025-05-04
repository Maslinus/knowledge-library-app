import React from 'react'
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom"
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Modal from "react-modal";
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

Modal.setAppElement("#root");

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />      
      </Routes>
      <ToastContainer position="bottom-left" />
    </BrowserRouter>
  )
}

export default App