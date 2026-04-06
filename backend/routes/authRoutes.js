//     /auth
import express from "express"
import { register, login} from "../controllers/authController.js"
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js"
import { atualizarUsuarios, criarUsuarioAdmin, deletarUsuario, listarUsuarios} from "../controllers/UserController.js"


const router = express.Router()

//Auth
router.post("/register", register)
router.post("/login", login)

//Verifica token e role
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user })
})
router.get("/admin", verifyToken,verifyAdmin)


//CRUD User
router.get("/users",verifyToken,verifyAdmin,listarUsuarios)
router.delete("/users/:id", verifyToken,deletarUsuario) //ao vou verificar adm aqui por que reutilizarei essa função pro usuario deletar sua propria conta
router.put("/users/:id",verifyToken,atualizarUsuarios)// nao vou verificar adm aqui por que reutilizarei essa função pro usuario atualizar seu proprio cadastro
router.post("/users", verifyToken, verifyAdmin, criarUsuarioAdmin)


export default router