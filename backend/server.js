import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import { dbReady } from "./database/configdb.js"
import taskRoutes from "./routes/tasksRoutes.js"
import projectRoutes from "./routes/projectsRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes) // rotas de autenticação
app.use("/tasks", taskRoutes)// Rotas Crud tasks
app.use("/projects", projectRoutes)


app.get("/", (req,res) => {
  res.send("API Funcionando")
});

dbReady
  .then(() => {
    app.listen(5000, "0.0.0.0", () => {
      console.log("Servidor rodando na porta 5000")
    })
  })
  .catch(() => {
    process.exit(1)
  })
