import express from "express"
import { register, login } from "../controllers/authController.js"
import { users } from  "../models/userModel.js"
const router = express.Router()

router.post("/register", register)
router.post("/login", login)

router.get("/debug/users",(req, res) => { // DELETAR DEPOIS APENAS DEBUG
  res.json(users)
})


import { verifyToken } from "../middleware/authMiddleware.js"

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user })
})

export default router