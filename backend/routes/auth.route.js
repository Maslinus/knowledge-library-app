import express from "express"
import { signin, signout, signup, verifyEmail } from "../controller/auth.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/verifyEmail", verifyEmail)
router.post("/signin", signin)
router.get("/signout", verifyToken, signout)

export default router