import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import "./database/configdb.js"
import taskRoutes from "./routes/tasksRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes) // rotas de autenticação
app.use("/tasks", taskRoutes)// Rotas Crud tasks


app.get("/", (req,res) => {
  res.send("API Funcionando")
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000")
})