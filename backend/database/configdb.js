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

async function getColumn(tableName, columnName) {
  const [rows] = await dbPromise.query(
    `SELECT COLUMN_NAME, IS_NULLABLE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [dbName, tableName, columnName]
  )

  return rows[0]
}

async function hasForeignKey(tableName, columnName) {
  const [rows] = await dbPromise.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [dbName, tableName, columnName]
  )

  return rows.length > 0
}

async function hasConstraint(tableName, constraintName) {
  const [rows] = await dbPromise.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?
     LIMIT 1`,
    [dbName, tableName, constraintName]
  )

  return rows.length > 0
}

async function getNullableUserIdentityFields() {
  const [rows] = await dbPromise.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
       AND COLUMN_NAME IN ('name', 'email', 'password')
       AND IS_NULLABLE = 'YES'`,
    [dbName]
  )

  return rows.map((row) => row.COLUMN_NAME)
}

async function assertNoNullUsersIdentityData() {
  const [rows] = await dbPromise.query(
    `SELECT COUNT(*) AS total
     FROM users
     WHERE name IS NULL OR email IS NULL OR password IS NULL`
  )

  if (rows[0].total > 0) {
    throw new Error(
      "Tabela users contem registros nulos em name/email/password. Corrija os dados antes de aplicar NOT NULL."
    )
  }
}

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

  if (!(await getColumn("users", "role"))) {
    await dbPromise.query(
      "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'"
    )
  }

  const nullableUserFields = await getNullableUserIdentityFields()

  if (nullableUserFields.length > 0) {
    await assertNoNullUsersIdentityData()
    await dbPromise.query(`
      ALTER TABLE users
      MODIFY name VARCHAR(255) NOT NULL,
      MODIFY email VARCHAR(255) NOT NULL,
      MODIFY password VARCHAR(255) NOT NULL
    `)
  }

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

  const [taskTable] = await dbPromise.query("SHOW TABLES LIKE 'tasks'")

  if (taskTable.length === 0) {
    await dbPromise.query(`
      CREATE TABLE tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        project_id INT NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    return
  }

  if (!(await getColumn("tasks", "project_id"))) {
    await dbPromise.query("ALTER TABLE tasks ADD COLUMN project_id INT NULL")
  }

  if (!(await getColumn("tasks", "created_at"))) {
    await dbPromise.query(
      "ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"
    )
  }

  if (await getColumn("tasks", "user_id")) {
    await dbPromise.query(`
      INSERT INTO projects (name, user_id)
      SELECT 'Minhas Tasks', users.id
      FROM users
      WHERE NOT EXISTS (
        SELECT 1
        FROM projects
        WHERE projects.user_id = users.id
          AND projects.name = 'Minhas Tasks'
      )
    `)

    await dbPromise.query(`
      UPDATE tasks
      INNER JOIN projects
        ON projects.user_id = tasks.user_id
       AND projects.name = 'Minhas Tasks'
      SET tasks.project_id = projects.id
      WHERE tasks.project_id IS NULL
    `)
  }

  if (!(await hasConstraint("projects", "uq_projects_user_name"))) {
    await dbPromise.query(
      "ALTER TABLE projects ADD CONSTRAINT uq_projects_user_name UNIQUE (user_id, name)"
    )
  }

  if (!(await hasForeignKey("tasks", "project_id"))) {
    await dbPromise.query(`
      ALTER TABLE tasks
      ADD CONSTRAINT fk_tasks_project
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    `)
  }

  const projectIdColumn = await getColumn("tasks", "project_id")

  if (projectIdColumn?.IS_NULLABLE === "YES") {
    const [rows] = await dbPromise.query(
      "SELECT COUNT(*) AS total FROM tasks WHERE project_id IS NULL"
    )

    if (rows[0].total === 0) {
      await dbPromise.query("ALTER TABLE tasks MODIFY project_id INT NOT NULL")
    }
  }

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
