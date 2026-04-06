import { deleteUser, updateUserById, getAllUsers, findUserById, createUser, findUserByEmail } from "../models/userModel.js"
import bcrypt from "bcrypt"

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "")
const hasText = (value) => normalizeText(value).length > 0

export function createUserController({
  deleteUserFn = deleteUser,
  updateUserByIdFn = updateUserById,
  getAllUsersFn = getAllUsers,
  findUserByIdFn = findUserById,
  createUserFn = createUser,
  findUserByEmailFn = findUserByEmail,
  bcryptLib = bcrypt,
} = {}) {
  async function deletarUsuario(req, res) { //Permite um admin excluir um usuario, e o proprio usuário excluir sua conta( mas somente a propria )
    const id = Number(req.params.id)
    const userExists = await findUserByIdFn(id)

    const isAdmin = req.user.role === "admin"
    const isSelf = req.user.id === id
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Você não tem permissão pra executar esta ação" })
    }

    if (!userExists) {
      return res.status(404).json({ message: "Usuario Nao encontrado" })
    }

    try {
      await deleteUserFn(id)
      res.json({ message: "Usuário Deletado" })
    } catch {
      res.status(500).json({ error: "Erro ao deletar usuário" })
    }
  }

  async function listarUsuarios(req, res) {
    try {
      const users = await getAllUsersFn()
      res.json(users)
    } catch {
      res.status(500).json({ error: "Erro ao buscar usuário" })
    }
  }

  async function atualizarUsuarios(req, res) {
    const id = Number(req.params.id)// Tem que tirar o id de string pra comparar com payload do JWT depois
    const { name, email, password, role } = req.body

    const isAdmin = req.user.role === "admin"
    const isSelf = req.user.id === id

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    const dataToUpdate = {}

    if (name !== undefined) {
      if (!hasText(name)) {
        return res.status(400).json({ message: "Nome nao pode ser vazio" })
      }

      dataToUpdate.name = normalizeText(name)
    }

    if (email !== undefined) {
      if (!hasText(email)) {
        return res.status(400).json({ message: "Email nao pode ser vazio" })
      }

      dataToUpdate.email = normalizeText(email)
    }

    if (password !== undefined) {
      if (!hasText(password)) {
        return res.status(400).json({ message: "Senha nao pode ser vazia" })
      }

      dataToUpdate.password = await bcryptLib.hash(password, 10)
    }

    if (isAdmin && role !== undefined) {
      dataToUpdate.role = role
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "Nenhum campo valido informado" })
    }

    try {
      await updateUserByIdFn(id, dataToUpdate)
      res.json({ message: "Usuário atualizado" })
    } catch {
      res.status(500).json({ message: "Erro ao atualizar usuário" })
    }
  }

  async function criarUsuarioAdmin(req, res) {
    const name = normalizeText(req.body.name)
    const email = normalizeText(req.body.email)
    const password = typeof req.body.password === "string" ? req.body.password : ""
    const { role } = req.body

    if (!name || !email || !hasText(password)) {
      return res.status(400).json({ message: "Nome, email e senha sao obrigatorios" })
    }

    try {
      const userExists = await findUserByEmailFn(email)

      if (userExists) {
        return res.status(400).json({ message: "Email já está em uso" })
      }

      const hashedPassword = await bcryptLib.hash(password, 10)

      const user = await createUserFn({
        name,
        email,
        password: hashedPassword,
        role,
      })

      res.status(201).json(user)
    } catch {
      res.status(500).json({ message: "Erro ao criar usuário" })
    }
  }

  return {
    deletarUsuario,
    listarUsuarios,
    atualizarUsuarios,
    criarUsuarioAdmin,
  }
}

export const {
  deletarUsuario,
  listarUsuarios,
  atualizarUsuarios,
  criarUsuarioAdmin,
} = createUserController()
