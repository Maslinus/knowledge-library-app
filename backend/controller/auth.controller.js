import TempUser from "../models/tempUser.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from 'crypto'; 
import nodemailer from 'nodemailer'

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body
    console.log(username)

    try {
        console.log(username)

    const existingUser = await User.findOne({ email })
    if (existingUser) return next(errorHandler(400, "User already exists"))

    const existingTemp = await TempUser.findOne({ email })
    if (existingTemp) return next(errorHandler(400, "Verification already sent"))

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
        subject: "Verify your email",
        text: `Your verification code is: ${verificationCode}`
    })

    res.status(200).json({
        success: true,
        message: "Verification code sent to your email"
    })
    } catch (error) {
    next(error)
    }
}

export const verifyEmail = async (req, res, next) => {
    const { email, code } = req.body

    try {
    const tempUser = await TempUser.findOne({ email })
    if (!tempUser) return next(errorHandler(404, "No verification request found"))

    if (tempUser.verificationCode !== code) {
        return next(errorHandler(400, "Invalid verification code"))
    }

    const newUser = new User({
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password
    })

    await newUser.save()
    await TempUser.deleteOne({ email })

    res.status(201).json({ success: true, message: "Email verified and user created" })
    } catch (error) {
    next(error)
    }
}

export const signin = async(req, res, next) =>{
    const {email, password} = req.body

    try {
        const validUser = await User.findOne({email})

        if(!validUser){
            return next(errorHandler(404, "User not found"))
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password)

        if(!validPassword){
            return next(errorHandler(401, "Wrong Credentials"))
        }

        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET)

        const {password: pass, ...rest } = validUser._doc

        res.cookie("access_token", token, {httpOnly: true}).status(200).json({
            success: true,
            message: "Login Successful!",
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
        message: "User logged out successfully",
      })
    } catch (error) {
      next(error)
    }
  }