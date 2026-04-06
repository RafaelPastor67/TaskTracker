import db from "../database/configdb.js"

export function createProject({ name, user_id }) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO projects (name, user_id) VALUES (?, ?)",
      [name, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

export function getProjectsByUser(user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, user_id, created_at FROM projects WHERE user_id = ? ORDER BY id ASC",
      [user_id],
      (err, results) => {
        if (err) return reject(err)
        resolve(results)
      }
    )
  })
}

export function getProjectById(project_id, user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, user_id, created_at FROM projects WHERE id = ? AND user_id = ? LIMIT 1",
      [project_id, user_id],
      (err, results) => {
        if (err) return reject(err)
        resolve(results[0])
      }
    )
  })
}

export function deleteProject(project_id, user_id) {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM projects WHERE id = ? AND user_id = ?",
      [project_id, user_id],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
