//     /auth
import express from "express"
import { register, login} from "../controllers/authController.js"
import { verifyToken } from "../middleware/authMiddleware.js"
import { deletarUsuario } from "../controllers/deleteUser.js"
import { verifyAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user })
})

router.delete("/users", verifyToken,deletarUsuario)
export default router

router.get("/admin", verifyAdmin)