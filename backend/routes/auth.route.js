import express from "express"
import { requestPasswordReset, signin, signout, signup, verifyEmail, verifyResetCodeAndChangePassword } from "../controller/auth.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()
console.log("auth router created");

router.post("/signup", (req, res, next) => {
  console.log("/signup route hit", req.body);
  signup(req, res, next);
});
router.post("/signup", signup)
router.post("/verifyEmail", verifyEmail)
router.post("/signin", signin)
router.get("/signout", verifyToken, signout)
router.post("/requestPasswordReset", requestPasswordReset)
router.post("/resetPassword", verifyResetCodeAndChangePassword)

export default router