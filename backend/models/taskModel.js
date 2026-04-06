import db from "../database/configdb.js"

export function createTask({ title, project_id }) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tasks (title, project_id) VALUES (?, ?)",
      [title, project_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

export function getTasksByProject(project_id, user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT tasks.*
       FROM tasks
       INNER JOIN projects ON projects.id = tasks.project_id
       WHERE tasks.project_id = ? AND projects.user_id = ?
       ORDER BY tasks.completed ASC, tasks.id DESC`,
      [project_id, user_id],
      (err, results) => {
        if (err) return reject(err)
        resolve(results)
      }
    )
  })
}

export function deleteTask(task_id, user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM tasks WHERE id = ? AND project_id IN (SELECT id FROM projects WHERE user_id = ?)",
      [task_id, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

export const updateTaskStatus = (id, user_id, completed) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE tasks SET completed = ? WHERE id = ? AND project_id IN (SELECT id FROM projects WHERE user_id = ?)",
      [completed, id, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
