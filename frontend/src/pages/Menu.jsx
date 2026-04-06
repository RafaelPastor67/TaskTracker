import { useEffect, useState } from "react"
import { FaFolderOpen, FaList } from "react-icons/fa6"
import { RiDeleteBin7Fill } from "react-icons/ri"
import { useNavigate, useParams } from "react-router-dom"
import { Sidebar } from "../assets/sidebar"
import { Footer } from "../assets/Footer"
import { Topbar } from "../assets/Topbar"
import { API_URL } from "../services/api"
import { clearToken, getToken } from "../services/utils/auth"

function Menu() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const [newTask, setNewTask] = useState("")
  const [isActiveTaskOpen, setIsActiveTaskOpen] = useState(true)
  const [isConcludedTaskOpen, setIsConcludedTaskOpen] = useState(true)

  const selectedProjectId = projectId ? Number(projectId) : null
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const logout = () => {
    clearToken()
    navigate("/")
  }

  useEffect(() => {
    let ignore = false

    const loadPage = async () => {
      const token = getToken()

      if (!token) {
        logout()
        return
      }

      setLoading(true)

      try {
        const projectsRes = await fetch(`${API_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!projectsRes.ok) {
          throw new Error("Erro ao buscar projetos")
        }

        const projectsData = await projectsRes.json()
        const safeProjects = Array.isArray(projectsData) ? projectsData : []

        if (ignore) return

        setProjects(safeProjects)

        if (safeProjects.length === 0) {
          setTasks([])
          setError("")
          return
        }

        const hasSelectedProject = Boolean(
          selectedProjectId && safeProjects.some((project) => project.id === selectedProjectId)
        )

        const nextProjectId = hasSelectedProject ? selectedProjectId : safeProjects[0].id

        if (!selectedProjectId || !hasSelectedProject) {
          navigate(`/projects/${nextProjectId}`, { replace: true })
        }

        const tasksRes = await fetch(`${API_URL}/tasks?projectId=${nextProjectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!tasksRes.ok) {
          throw new Error("Erro ao buscar tasks")
        }

        const tasksData = await tasksRes.json()

        if (ignore) return

        setTasks(Array.isArray(tasksData) ? tasksData : [])
        setError("")
      } catch (err) {
        console.error("Erro ao carregar dados:", err)

        if (!ignore) {
          setError("Nao foi possivel carregar os dados do projeto.")
          setTasks([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      ignore = true
    }
  }, [navigate, selectedProjectId])

  const toggleTask = async (id, completed) => {
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (!res.ok) {
        throw new Error("Erro ao atualizar task")
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !completed } : task
        )
      )
    } catch (err) {
      console.error("Erro ao atualizar task:", err)
      setError("Nao foi possivel atualizar a task.")
    }
  }

  const deleteTask = async (id) => {
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Erro ao deletar task")
      }

      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      console.error("Erro ao deletar task:", err)
      setError("Nao foi possivel deletar a task.")
    }
  }

  const createProject = async (event) => {
    event.preventDefault()

    const name = newProjectName.trim()
    if (!name) return

    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const created = await res.json()

      if (!res.ok) {
        throw new Error(created.error || "Erro ao criar projeto")
      }

      setProjects((prev) => [...prev, created])
      setNewProjectName("")
      setError("")
      navigate(`/projects/${created.id}`)
    } catch (err) {
      console.error("Erro ao criar projeto:", err)
      setError(err.message || "Nao foi possivel criar o projeto.")
    }
  }

  const createTask = async (event) => {
    event.preventDefault()

    const title = newTask.trim()
    if (!title || !selectedProjectId) return

    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, projectId: selectedProjectId }),
      })

      const created = await res.json()

      if (!res.ok) {
        throw new Error(created.error || "Erro ao criar task")
      }

      setTasks((prev) => [...prev, created])
      setNewTask("")
      setError("")
    } catch (err) {
      console.error("Erro ao criar task:", err)
      setError(err.message || "Nao foi possivel criar a task.")
    }
  }

  const deleteProject = async () => {
    if (!selectedProject) return

    const token = getToken()
    const confirmed = window.confirm(
      `Excluir o projeto "${selectedProject.name}"? Todas as tasks dele tambem serao apagadas.`
    )

    if (!confirmed) return

    try {
      const res = await fetch(`${API_URL}/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Erro ao deletar projeto")
      }

      const remainingProjects = projects.filter((project) => project.id !== selectedProject.id)
      setProjects(remainingProjects)
      setTasks([])
      setError("")

      if (remainingProjects.length > 0) {
        navigate(`/projects/${remainingProjects[0].id}`, { replace: true })
        return
      }

      navigate("/projects", { replace: true })
    } catch (err) {
      console.error("Erro ao deletar projeto:", err)
      setError("Nao foi possivel deletar o projeto.")
    }
  }

  return (
    <div>
      <div className="layout">
        <Sidebar />

        <div className="mainframe">
          <Topbar />

          <main>
            <section className="project-panel">
              {loading ? (
                <div className="empty-project-state acrylic">
                  <p>Carregando projeto...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="empty-project-state acrylic">
                  <FaFolderOpen className="empty-project-icon" />
                  <h2>Nenhum projeto criado</h2>
                  <p>
                    Crie seu primeiro projeto abaixo. Cada projeto
                    passa a ter sua propria lista de tasks.
                  </p>
                  <form className="project-creator-form" onSubmit={createProject}>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(event) => setNewProjectName(event.target.value)}
                      placeholder="Nome do projeto"
                    />
                    <button type="submit">Criar projeto</button>
                  </form>
                  {error && <p className="project-helper error">{error}</p>}
                </div>
              ) : (
                <>
                  <div className="project-panel-header">
                    <div>
                      <p className="project-label">Projeto ativo</p>
                      <h2>{selectedProject?.name}</h2>
                      <p className="project-meta">
                        {activeTasks.length} ativas - {completedTasks.length} concluidas
                      </p>
                    </div>

                    <button
                      type="button"
                      className="project-delete-button"
                      onClick={deleteProject}
                    >
                      <RiDeleteBin7Fill />
                      Excluir projeto
                    </button>
                  </div>

                  <form className="input-tasks-flex" onSubmit={createTask}>
                    <input
                      className="input-task"
                      type="text"
                      value={newTask}
                      onChange={(event) => setNewTask(event.target.value)}
                      placeholder={`Nova task em ${selectedProject?.name ?? "projeto"}...`}
                    />
                    <button type="submit">Adicionar</button>
                  </form>

                  {error && <p className="main-error">{error}</p>}

                  <div className="card">
                    <div
                      className="card-header"
                      onClick={() => {
                        setIsActiveTaskOpen((prev) => !prev)
                      }}
                    >
                      <FaList />
                      <span>ACTIVE TASK</span>
                      <span className="badge rounded-pill text-bg-primary">{activeTasks.length}</span>
                    </div>

                    {isActiveTaskOpen && (
                      <div className="card-body">
                        {activeTasks.length === 0 ? (
                          <p className="task">Nenhuma task ativa neste projeto</p>
                        ) : (
                          activeTasks.map((task) => (
                            <div className="task" key={task.id}>
                              <input
                                className="task-check"
                                type="checkbox"
                                checked={Boolean(task.completed)}
                                onChange={() => toggleTask(task.id, task.completed)}
                              />
                              <p
                                style={{
                                  textDecoration: task.completed ? "line-through" : "none",
                                }}
                              >
                                {task.title}
                              </p>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => deleteTask(task.id)}
                              >
                                <RiDeleteBin7Fill />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {completedTasks.length > 0 && (
                    <div className="card task-concluidas">
                      <div
                        className="card-header"
                        onClick={() => {
                          setIsConcludedTaskOpen((prev) => !prev)
                        }}
                      >
                        <FaList />
                        <span>CONCLUIDAS</span>
                        <span className="badge rounded-pill text-bg-primary">{completedTasks.length}</span>
                      </div>

                      {isConcludedTaskOpen && (
                        <div className="card-body">
                          {completedTasks.map((task) => (
                            <div className="task" key={task.id}>
                              <input
                                className="task-check"
                                type="checkbox"
                                checked={Boolean(task.completed)}
                                onChange={() => toggleTask(task.id, task.completed)}
                              />
                              <p
                                style={{
                                  textDecoration: task.completed ? "line-through" : "none",
                                }}
                              >
                                {task.title}
                              </p>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => deleteTask(task.id)}
                              >
                                <RiDeleteBin7Fill />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Menu
