import React, { useState } from 'react'
import PasswordInput from '../../components/Input/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axios from 'axios'
import { toast } from 'react-toastify'
import VerificationCodeInput from '../../components/Input/VerificationCodeInput'

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!name) return setError("Пожалуйста, введите ваше имя")
    if (!validateEmail(email)) return setError("Пожалуйста, введите действительный адрес электронной почты")
    if (!password) return setError("Пожалуйста, введите пароль")

    setError("")

    try {
      const res = await axios.post(
        "https://marvelous-panda-f9f040.netlify.app/api/auth/signup",
        { username: name, email, password },
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        return
      }

      toast.success("Код подтверждения отправлен на ваш адрес электронной почты.")
      setStep(2)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed")
      setError(error?.response?.data?.message || error.message)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!code || code.length !== 6) {
      return setError("Введите 6-значный проверочный код.")
    }

    try {
      const res = await axios.post(
        "https://marvelous-panda-f9f040.netlify.app/api/auth/verifyEmail",
        {
          email,
          username: name,
          password,
          code,
        },
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        return
      }

      toast.success("Учетная запись проверена. Теперь вы можете войти в систему.")
      navigate("/login")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed")
      setError(error?.response?.data?.message || error.message)
    }
  }

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={step === 1 ? handleSignUp : handleVerify}>
          <h4 className="text-2xl mb-7">{step === 1 ? "Sign Up" : "Verify Email"}</h4>

          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="input-box"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
            </>
          )}

          {step === 2 && (
            <VerificationCodeInput email={email} code={code} setCode={setCode} />
          )}

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            {step === 1 ? "SIGN UP" : "VERIFY CODE"}
          </button>

          {step === 1 && (
            <p className="text-sm text-center mt-4">
              У вас уже есть аккаунт?{" "}
              <Link
                to={"/login"}
                className="font-medium text-[#2B85FF] underline"
              >
                Login
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Signup
