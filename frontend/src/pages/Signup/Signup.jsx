import React, { useState } from 'react'
import PasswordInput from '../../components/Input/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axios from 'axios'
import { toast } from 'react-toastify'

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState(1) // 1 - регистрация, 2 - подтверждение
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!name) return setError("Please enter your name")
    if (!validateEmail(email)) return setError("Please enter a valid email address")
    if (!password) return setError("Please enter the password")

    setError("")

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/signup",
        { username: name, email, password },
        { withCredentials: true }
      )

      if (res.data.success === false) {
        toast.error(res.data.message)
        return
      }

      toast.success("Verification code sent to your email.")
      setStep(2)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed")
      setError(error?.response?.data?.message || error.message)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!code || code.length !== 6) {
      return setError("Please enter the 6-digit verification code")
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/verifyEmail",
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

      toast.success("Account verified. You can now log in.")
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
            <>
              <p className="text-sm mb-2 text-gray-600">
                A verification code has been sent to <b>{email}</b>.
              </p>
              <input
                type="text"
                placeholder="Enter verification code"
                className="input-box"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </>
          )}

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            {step === 1 ? "SIGN UP" : "VERIFY CODE"}
          </button>

          {step === 1 && (
            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
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
