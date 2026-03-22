import { createTask, getTasksByUser, deleteTask, updateTaskStatus  } from "../models/taskModel.js"

export const getTasks = async (req, res) => {
  try {
    const user_id = req.user.id

    const tasks = await getTasksByUser(user_id)

    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar tasks" })
  }
}

export const createTaskController = async (req, res) => {
  try {
    const { title } = req.body
    const user_id = req.user.id
    
    
    const result = await createTask({ title, user_id })

    res.status(201).json({ message: "Task criada", id: result.insertId })
  } catch (err) {
    console.error("ERRO: ", err)
    res.status(500).json({ error: "Erro ao criar task" })
  }
}

export const deleteTaskController = async (req, res) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const result = await deleteTask(id, user_id)
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task não encontrada" })
    }

    res.json({ message: "Task deletada" })
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar task" })
  }
}

export const updateTask = async (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  
  try {
    await updateTaskStatus(id, completed)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao atualizar task" })
  }
}