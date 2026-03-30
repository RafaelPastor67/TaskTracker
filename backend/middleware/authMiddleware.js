import jwt from "jsonwebtoken"

import dotenv from "dotenv" // carrrega a palavra secreta do JWT 
dotenv.config({ path: ".env.example" })// carrrega a palavra secreta do JWT -
const secret = (process.env.JWT_SECRET) // armazena a chave

//Validação do Token

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization

  if (!authHeader) return res.status(401).json({ message: "No token" })

  const token = authHeader.split(" ")[1]
  try {

    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()

  } catch {
    return res.status(403).json({ message: "Invalid token" })
  }
}

export const verifyAdmin = async (req,res,next) => {
  const userId = req.user.id

  const user = await buscarUsuarioPorId(userId)

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" })
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado" })
  }

  next()
}

//  localhost:3000/auth/admin
// token: bearer $#32dsad!@#!@$@##

// 200