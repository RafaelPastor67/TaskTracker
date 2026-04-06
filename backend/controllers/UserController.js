import { deleteUser, updateUserById, getAllUsers, findUserById, createUser, findUserByEmail } from "../models/userModel.js"
import bcrypt from "bcrypt"

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

    const dataToUpdate = {
      name,
      email,
    }

    if (password) {
      dataToUpdate.password = await bcryptLib.hash(password, 10)
    }

    if (isAdmin) {
      dataToUpdate.role = role
    }

    try {
      await updateUserByIdFn(id, dataToUpdate)
      res.json({ message: "Usuário atualizado" })
    } catch {
      res.status(500).json({ message: "Erro ao atualizar usuário" })
    }
  }

  async function criarUsuarioAdmin(req, res) {
    const { name, email, password, role } = req.body

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
