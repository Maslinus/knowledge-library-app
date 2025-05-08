import express from "express"
import { requestPasswordReset, signin, signout, signup, verifyEmail, verifyResetCodeAndChangePassword } from "../controller/auth.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/verifyEmail", verifyEmail)
router.post("/signin", signin)
router.get("/signout", verifyToken, signout)
router.post("/requestPasswordReset", requestPasswordReset)
router.post("/resetPassword", verifyResetCodeAndChangePassword)

export default router