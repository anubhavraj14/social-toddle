import express from "express";
import { login,register,logout,updatePassword } from "../controllers/auth.js";

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
//update password route 
router.post("/updatePassword", updatePassword)
router.post("/logout", logout)


export default router