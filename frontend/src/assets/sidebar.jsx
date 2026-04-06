import { useEffect, useState } from "react"
import { FaFolderOpen, FaTasks, FaUser } from "react-icons/fa"
import { TfiBarChart } from "react-icons/tfi"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import logo from "./logo.svg"
import { API_URL } from "../services/api"
import { decodeRole, getToken } from "../services/utils/auth"

export function Sidebar() {
  const token = getToken()
  const role = decodeRole(token)
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    const fetchProjects = async () => {
      if (!token) {
        if (!ignore) {
          setProjects([])
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch(`${API_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Erro ao buscar projetos")
        }

        const data = await res.json()

        if (!ignore) {
          setProjects(Array.isArray(data) ? data : [])
          setError("")
        }
      } catch (err) {
        console.error("Erro ao buscar projetos:", err)

        if (!ignore) {
          setProjects([])
          setError("Nao foi possivel carregar os projetos.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    fetchProjects()

    return () => {
      ignore = true
    }
  }, [location.pathname, token])

  const createProject = async (event) => {
    event.preventDefault()

    const name = newProjectName.trim()
    if (!name || !token) return

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar projeto")
      }

      setProjects((prev) => [...prev, data])
      setNewProjectName("")
      setError("")
      navigate(`/projects/${data.id}`)
    } catch (err) {
      console.error("Erro ao criar projeto:", err)
      setError(err.message || "Nao foi possivel criar o projeto.")
    }
  }

  return (
    <div className="Sidebar-root">
      <header className="acrylic sideHeader">
        <img width="40" src={logo} alt="Logo" />
        <h3>TASKFLOW</h3>
      </header>

      <div className="Sidebar">
        <NavLink
          to="/projects"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <i className="icon"><FaTasks /></i>
          <p>Tasks</p>
        </NavLink>

        {role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            <i className="icon"><FaUser /></i>
            Admin
          </NavLink>
        )}
      </div>

      <div className="sidebar-projects">
        <div className="sidebar-section-title">
          <FaFolderOpen />
          <span>Projetos</span>
        </div>

        {loading && <p className="sidebar-muted">Carregando projetos...</p>}

        {!loading && projects.length === 0 && (
          <p className="sidebar-muted">
            Crie um projeto para separar suas tasks por guia.
          </p>
        )}

        {projects.length > 0 && (
          <div className="sidebar-project-list">
            {projects.map((project) => (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                className={({ isActive }) => (isActive ? "project-link active" : "project-link")}
              >
                {project.name}
              </NavLink>
            ))}
          </div>
        )}

        {error && <p className="sidebar-error">{error}</p>}

        <form className="sidebar-project-form" onSubmit={createProject}>
          <input
            type="text"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="Novo projeto"
          />
          <button type="submit">
            Criar projeto
          </button>
        </form>
      </div>
    </div>
  )
}
