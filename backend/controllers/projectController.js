import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectsByUser,
} from "../models/projectModel.js"

export function createProjectControllerHandlers({
  createProjectFn = createProject,
  getProjectsByUserFn = getProjectsByUser,
  getProjectByIdFn = getProjectById,
  deleteProjectFn = deleteProject,
} = {}) {
  const getProjects = async (req, res) => {
    try {
      const projects = await getProjectsByUserFn(req.user.id)
      res.json(projects)
    } catch {
      res.status(500).json({ error: "Erro ao buscar projetos" })
    }
  }

  const createProjectController = async (req, res) => {
    try {
      const name = req.body.name?.trim()
      const user_id = req.user.id

      if (!name) {
        return res.status(400).json({ error: "Nome obrigatorio" })
      }

      const result = await createProjectFn({ name, user_id })

      res.status(201).json({
        id: result.insertId,
        name,
        user_id,
      })
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Projeto com esse nome ja existe" })
      }

      console.error(err)
      res.status(500).json({ error: "Erro ao criar projeto" })
    }
  }

  const getProject = async (req, res) => {
    try {
      const project = await getProjectByIdFn(req.params.id, req.user.id)

      if (!project) {
        return res.status(404).json({ error: "Projeto nao encontrado" })
      }

      res.json(project)
    } catch {
      res.status(500).json({ error: "Erro ao buscar projeto" })
    }
  }

  const deleteProjectController = async (req, res) => {
    try {
      const result = await deleteProjectFn(req.params.id, req.user.id)

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Projeto nao encontrado" })
      }

      res.json({ message: "Projeto deletado" })
    } catch {
      res.status(500).json({ error: "Erro ao deletar projeto" })
    }
  }

  return {
    getProjects,
    getProject,
    createProjectController,
    deleteProjectController,
  }
}

export const {
  getProjects,
  getProject,
  createProjectController,
  deleteProjectController,
} = createProjectControllerHandlers()
