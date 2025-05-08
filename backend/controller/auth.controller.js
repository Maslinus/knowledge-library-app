import TempUser from "../models/tempUser.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from 'crypto'; 
import nodemailer from 'nodemailer'

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body

    try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return next(errorHandler(400, "Пользователь уже существует"))

    const existingTemp = await TempUser.findOne({ email })
    if (existingTemp) return next(errorHandler(400, "Код подтверждения уже отправлено"))

    const hashedPassword = bcryptjs.hashSync(password, 10)
    const verificationCode = crypto.randomBytes(3).toString("hex")

    const tempUser = new TempUser({
        username,
        email,
        password: hashedPassword,
        verificationCode
    })

    await tempUser.save()

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Подтвердите свой адрес электронной почты",
        text: `Ваш проверочный код: ${verificationCode}`
    })

    res.status(200).json({
        success: true,
        message: "Код подтверждения отправлен на вашу электронную почту"
    })
    } catch (error) {
    next(error)
    }
}

export const verifyEmail = async (req, res, next) => {
    const { email, code } = req.body

    try {
    const tempUser = await TempUser.findOne({ email })
    if (!tempUser) return next(errorHandler(404, "Запрос на проверку не найден"))

    if (tempUser.verificationCode !== code) {
        return next(errorHandler(400, "Неверный код подтверждения"))
    }

    const newUser = new User({
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password
    })

    await newUser.save()
    await TempUser.deleteOne({ email })

    res.status(201).json({ success: true, message: "Аккаунт успешно создан" })
    } catch (error) {
    next(error)
    }
}

export const signin = async(req, res, next) =>{
    const {email, password} = req.body

    try {
        const validUser = await User.findOne({email})

        if(!validUser){
            return next(errorHandler(404, "Пользователь не найден"))
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password)

        if(!validPassword){
            return next(errorHandler(401, "Неправильные учетные данные"))
        }

        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET)

        const {password: pass, ...rest } = validUser._doc

        res.cookie("access_token", token, {httpOnly: true}).status(200).json({
            success: true,
            message: "Вход выполнен успешно!",
            rest,
        })
    } catch (error) {
        next(error)
    }
}

export const signout = async (req, res, next) => {
    try {
    res.clearCookie("access_token")

    res.status(200).json({
        success: true,
        message: "Пользователь успешно вышел из системы",
    })
    } catch (error) {
    next(error)
    }
}

const resetCodes = new Map()

export const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return next(errorHandler(404, "Пользователь не найден"))

    const code = crypto.randomInt(100000, 999999).toString()
    resetCodes.set(email, { code, expires: Date.now() + 10 * 60 * 100 })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Код для сброса пароля",
      text: `Ваш код сброса пароля: ${code}`
    })

    res.status(200).json({ success: true, message: "Код отправлен на почту" })
  } catch (error) {
    next(error)
  }
}

export const verifyResetCodeAndChangePassword = async (req, res, next) => {
  const { email, code, newPassword } = req.body
  try {
    const stored = resetCodes.get(email)
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      return next(errorHandler(400, "Неверный или просроченный код"))
    }

    const user = await User.findOne({ email })
    if (!user) return next(errorHandler(404, "Пользователь не найден"))

    const hashed = bcryptjs.hashSync(newPassword, 10)
    user.password = hashed
    await user.save()

    resetCodes.delete(email)

    res.status(200).json({ success: true, message: "Пароль успешно обновлён" })
  } catch (error) {
    next(error)
  }
}