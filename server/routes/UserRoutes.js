import express from "express";
import { Signup } from "../controllers/User.js";
import { verify } from "../controllers/User.js";
import { resend } from "../controllers/User.js";
const router = express.Router();

router.post("/signup", Signup);
router.post("/verifyOTP", verify);
router.post("/resend", resend);

export default router 
