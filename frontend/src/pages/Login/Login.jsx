import React, { useState } from "react"
import PasswordInput from "../../components/Input/PasswordInput"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utils/helper"
import { useDispatch } from "react-redux"
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice"
import axios from "axios"
import { toast } from "react-toastify"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
 
  const [mode, setMode] = useState("login")

  const [resetEmail, setResetEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async(e) =>{
    e.preventDefault()

    if (!validateEmail(email)) {
      setError("Пожалуйста, введите действительный адрес электронной почты")
      return
    }

    if (!password) {
      setError("Пожалуйста, введите пароль")
      return
    }

    setError("")

    try {
      dispatch(signInStart())

      const res = await axios.post(
        "http://localhost:3000/api/auth/signin",
        { email, password },
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        console.log(res.data)
        dispatch(signInFailure(data.message))
      }

      toast.success(res.data.message)
      dispatch(signInSuccess(res.data))
      navigate("/")

    } catch (error) {
      console.log(error)
      toast.error(error.message)
      dispatch(signInFailure(error.message))
    }
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    if (!validateEmail(resetEmail)) return toast.error("Введите корректный email")
    try {
      const res = await axios.post("http://localhost:3000/api/auth/requestPasswordReset", { email: resetEmail })
      toast.success(res.data.message)
      setMode("reset")
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка при отправке кода")
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!code || !newPassword) return toast.error("Введите код и новый пароль")
    try {
      const res = await axios.post("http://localhost:3000/api/auth/resetPassword", {
        email: resetEmail,
        code,
        newPassword,
      })
      toast.success(res.data.message)
      setMode("login")
      setResetEmail("")
      setCode("")
      setNewPassword("")
    } catch (err) {
      toast.error(err.response?.data?.message || "Сброс пароля не удался")
    }
  }

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
      {mode === "login" && (
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl mb-7">Login</h4>

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              LOGIN
            </button>

            <p className="text-sm text-center mt-4">
              Еще не зарегистрированы?{" "}
              <Link to={"/signup"} className="font-medium text-[#2B85FF] underline">
                Создать аккаунт
              </Link>
            </p>

            <div className="text-center mt-2">
              <button
                type="button"
                className="text-sm text-blue-500 underline"
                onClick={() => setMode("request")}
              >
                Забыли пароль?
              </button>
            </div>
          </form>
        )}

        {mode === "request" && (
          <form onSubmit={handleResetRequest}>
            <h4 className="text-xl mb-4 text-center">Восстановление пароля</h4>
            <input
              type="email"
              className="input-box"
              placeholder="Введите email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <button type="submit" className="btn-primary mt-4 w-full">
              Отправить код
            </button>
            <p
              className="text-sm mt-3 text-center text-gray-600 cursor-pointer underline"
              onClick={() => setMode("login")}
            >
              Назад ко входу
            </p>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handlePasswordReset}>
            <h4 className="text-xl mb-4 text-center">Введите код и новый пароль</h4>
            <input
              type="text"
              className="input-box"
              placeholder="Код из письма"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              className="input-box"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary mt-4 w-full">
              Сменить пароль
            </button>
            <p
              className="text-sm mt-3 text-center text-gray-600 cursor-pointer underline"
              onClick={() => setMode("login")}
            >
              Назад ко входу
            </p>
          </form>
        )}
      </div>
    </div> 
  )
}

export default Login