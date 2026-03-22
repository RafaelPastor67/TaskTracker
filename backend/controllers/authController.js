import bcrypt from "bcrypt" // lib que vai encrpitar a senhas e fazer suas validações
import jwt from "jsonwebtoken" // cria os tokens de autenticação e valida
import { createUser, findUserByEmail,deleteUser } from "../models/userModel.js"
import dotenv from "dotenv" // carrrega a palavra secreta do JWT 
dotenv.config({ path: ".env.example" })// carrrega a palavra secreta do JWT -

const secret = (process.env.JWT_SECRET) // armazena a chave

export const register = async (req, res) => {

  const { name, email, password } = req.body
  const userExists = await findUserByEmail(email)
  if (userExists) return res.status(400).json({ message: "Email already used" })

  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = createUser({
    name,
    email,
    password: hashedPassword
  })

  res.json(user)
}

export const login = async (req, res) => {

  const { email, password } = req.body
  const user = await findUserByEmail(email)
  if (!user){
    return res.status(400).json({ message: "Invalid credentials" })
  }
     

  const valid = await bcrypt.compare(password, user.password)
  if (!valid){
    return res.status(400).json({ message: "Invalid credentials" })
  } 

  const token = jwt.sign( // Cria o token com a assinatura que ta sendo puxada do .env de exemplo
    { email: user.email },
    secret,
    { expiresIn: "1h" }
  )

  res.json({ token })
}
////////////////////////////////

export function deletarUsuario(email){ // NAO TA PRONTO
    deleteUser(email)
  }



