import mongoose from "mongoose"

const tempUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }
})

const TempUser = mongoose.model("TempUser", tempUserSchema)

export default TempUser
