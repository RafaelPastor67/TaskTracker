import { createTask, getTasksByProject, deleteTask, updateTaskStatus } from "../models/taskModel.js"
import { getProjectById } from "../models/projectModel.js"

export function createTaskControllerHandlers({
  createTaskFn = createTask,
  getTasksByProjectFn = getTasksByProject,
  deleteTaskFn = deleteTask,
  updateTaskStatusFn = updateTaskStatus,
  getProjectByIdFn = getProjectById,
} = {}) {
  const getTasks = async (req, res) => {
    try {
      const user_id = req.user.id
      const project_id = Number(req.query.projectId)

      if (!project_id) {
        return res.status(400).json({ error: "projectId is required" })
      }

      const project = await getProjectByIdFn(project_id, user_id)

      if (!project) {
        return res.status(404).json({ error: "Projeto nao encontrado" })
      }

      const tasks = await getTasksByProjectFn(project_id, user_id)
      res.json(tasks)
    } catch {
      res.status(500).json({ error: "Erro ao buscar tasks" })
    }
  }

  const createTaskController = async (req, res) => {
    try {
      const title = req.body.title?.trim()
      const project_id = Number(req.body.projectId)
      const user_id = req.user.id

      if (!title) {
        return res.status(400).json({ error: "Titulo obrigatorio" })
      }

      if (!project_id) {
        return res.status(400).json({ error: "projectId is required" })
      }

      const project = await getProjectByIdFn(project_id, user_id)

      if (!project) {
        return res.status(404).json({ error: "Projeto nao encontrado" })
      }

      const result = await createTaskFn({ title, project_id })

      res.status(201).json({
        id: result.insertId,
        title,
        completed: false,
        project_id,
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
        return res.status(404).json({ message: "Task nao encontrada" })
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
        return res.status(404).json({ message: "Task nao encontrada" })
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
