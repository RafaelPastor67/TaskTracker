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