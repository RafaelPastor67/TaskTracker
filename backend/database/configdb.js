import mysql from "mysql2"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config({ path: ".env" })

const dbName = process.env.DB_NAME
const defaultAdminUser = {
  name: "Administrador",
  email: "admin@email.com",
  password: "admin",
  role: "admin",
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: dbName,
})

const dbPromise = db.promise()

async function ensureDefaultAdminUser() {
  const [rows] = await dbPromise.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [defaultAdminUser.email]
  )

  if (rows.length > 0) {
    return
  }

  const hashedPassword = await bcrypt.hash(defaultAdminUser.password, 10)

  await dbPromise.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [
      defaultAdminUser.name,
      defaultAdminUser.email,
      hashedPassword,
      defaultAdminUser.role,
    ]
  )

  console.log(`Usuario admin padrao criado: ${defaultAdminUser.email}`)
}

async function ensureDatabaseSchema() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      role VARCHAR(20) NOT NULL DEFAULT 'user'
    )
  `)

  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT uq_projects_user_name UNIQUE (user_id, name)
    )
  `)

  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      project_id INT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

  await ensureDefaultAdminUser()
}

export const dbReady = new Promise((resolve, reject) => {
  db.connect(async (error) => {
    if (error) {
      console.error("Erro ao conectar:", error)
      reject(error)
      return
    }

    try {
      await ensureDatabaseSchema()
      console.log("Conexao estabelecida com banco MYSQL")
      resolve()
    } catch (schemaError) {
      console.error("Erro ao preparar schema:", schemaError)
      reject(schemaError)
    }
  })
})

export default db
