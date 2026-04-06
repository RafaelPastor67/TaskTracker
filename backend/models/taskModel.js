import db from "../database/configdb.js"

export function createTask({ title, user_id }) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tasks (title, user_id) VALUES (?, ?)",
      [title, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

export function getTasksByUser(user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM tasks WHERE user_id = ?",
      [user_id],
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
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
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
      "UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?",
      [completed, id, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
