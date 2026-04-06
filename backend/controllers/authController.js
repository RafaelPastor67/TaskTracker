import bcrypt from "bcrypt" // lib que vai encrpitar a senhas e fazer suas validaÃ§Ãµes
import jwt from "jsonwebtoken" // cria os tokens de autenticaÃ§Ã£o e valida
import { createUser, findUserByEmail } from "../models/userModel.js"
import dotenv from "dotenv" // carrrega a palavra secreta do JWT

dotenv.config({ path: ".env" })// carrrega a palavra secreta do JWT -

const secret = process.env.JWT_SECRET // armazena a chave

export function createAuthController({ //Fabrica pros testes
  createUserFn = createUser,
  findUserByEmailFn = findUserByEmail,
  bcryptLib = bcrypt,
  jwtLib = jwt,
  jwtSecret = secret,
} = {}) 
{
  const register = async (req, res) => {
    const { name, email, password } = req.body
    const userExists = await findUserByEmailFn(email)
    if (userExists) return res.status(400).json({ message: "Email already used" })

    const hashedPassword = await bcryptLib.hash(password, 10)

    const user = await createUserFn({
      name,
      email,
      password: hashedPassword,
    })

    res.json(user)
  }

  const login = async (req, res) => {
    const { email, password } = req.body
    const user = await findUserByEmailFn(email)
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const valid = await bcryptLib.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwtLib.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    )

    res.json({ token })
  }

  return { register, login }
}

export const { register, login } = createAuthController()
