import express from "express"
import { register, login, deletarUsuario} from "../controllers/authController.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user })
})

router.delete("/users", deletarUsuario)//em produção, ainda nao funciona
export default router