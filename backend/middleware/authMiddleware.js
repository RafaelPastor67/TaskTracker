import jwt from "jsonwebtoken"
import dotenv from "dotenv" // carrrega a palavra secreta do JWT
import { findUserById } from "../models/userModel.js"

dotenv.config({ path: ".env" })// carrrega a palavra secreta do JWT -

const secret = process.env.JWT_SECRET // armazena a chave

export function createAuthMiddleware({
  jwtLib = jwt,
  findUserByIdFn = findUserById,
  jwtSecret = secret,
} = {}) {
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) return res.status(401).json({ message: "No token" })

    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwtLib.verify(token, jwtSecret)
      req.user = decoded
      next()
    } catch {
      return res.status(403).json({ message: "Invalid token" })
    }
  }

  const verifyAdmin = async (req, res, next) => {
    const userId = req.user.id
    const user = await findUserByIdFn(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" })
    }

    next()
  }

  return { verifyToken, verifyAdmin }
}

export const { verifyToken, verifyAdmin } = createAuthMiddleware()
