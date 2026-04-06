import { createTask, getTasksByUser, deleteTask, updateTaskStatus } from "../models/taskModel.js"

export function createTaskControllerHandlers({
  createTaskFn = createTask,
  getTasksByUserFn = getTasksByUser,
  deleteTaskFn = deleteTask,
  updateTaskStatusFn = updateTaskStatus,
} = {}) {
  const getTasks = async (req, res) => {
    try {
      const user_id = req.user.id
      const tasks = await getTasksByUserFn(user_id)
      res.json(tasks)
    } catch {
      res.status(500).json({ error: "Erro ao buscar tasks" })
    }
  }

  const createTaskController = async (req, res) => {
    try {
      const { title } = req.body
      const user_id = req.user.id
      const result = await createTaskFn({ title, user_id })

      res.status(201).json({
        id: result.insertId,
        title,
        completed: false,
        user_id,
      })
    } catch (err) {
      console.error("ERRO: ", err)
      res.status(500).json({ error: "Erro ao criar task" })
    }
  }

  const deleteTaskController = async (req, res) => {
    try {
      const { id } = req.params
      const user_id = req.user.id
      const result = await deleteTaskFn(id, user_id)

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task não encontrada" })
      }

      res.json({ message: "Task deletada" })
    } catch {
      res.status(500).json({ error: "Erro ao deletar task" })
    }
  }

  const updateTask = async (req, res) => {
    const { id } = req.params
    const { completed } = req.body
    const user_id = req.user.id

    try {
      const result = await updateTaskStatusFn(id, user_id, completed)

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task não encontrada" })
      }

      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao atualizar task" })
    }
  }

  return {
    getTasks,
    createTaskController,
    deleteTaskController,
    updateTask,
  }
}

export const {
  getTasks,
  createTaskController,
  deleteTaskController,
  updateTask,
} = createTaskControllerHandlers()
