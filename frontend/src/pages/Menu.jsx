import { useEffect, useState } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaList } from "react-icons/fa6";
import { MdOutlineLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../assets/sidebar";
import { Footer } from "../assets/Footer";
import { Topbar } from "../assets/Topbar";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { getToken, decodeUser } from "../services/utils/auth";


function Menu() {
  
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")
  const [isActiveTaskOpen, setisActiveTaskOpen] = useState(true)
  const [isConcludedTaskOpen, setisConcludedTaskOpen] = useState(true)
  const activeTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)




const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
}



  const fetchTasks = async () => {
    const token = getToken()

    if (!token) return logout()

    const username = decodeUser(token)
    if (!username) return logout()

    setUser(username)

    try {
      const res = await fetch("http://localhost:5000/tasks", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao buscar tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id, completed) => {
    const token = getToken()

    try {
      await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed })
      })

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, completed: !completed } : task
        )
      )
    } catch (err) {
      console.error("Erro ao atualizar task:", err)
    }
  }

  const deleteTask = async (id) => {
    const token = getToken()

    try {
      await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (err) {
      console.error("Erro ao deletar task:", err)
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const token = getToken()

    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTask })
      })

      const created = await res.json()
      setTasks(prev => [...prev, created])
      setNewTask("")
    } catch (err) {
      console.error("Erro ao criar task:", err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading) return <p>Carregando...</p>



  return (

    <div>
      <div className="layout">

        <Sidebar />

        <div className="mainframe">

          <Topbar />
          <main>

            <form className="input-tasks-flex" onSubmit={createTask} style={{ marginBottom: "15px" }}>
              <input className="input-task"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Nova task..."
              />
              <button type="submit">Adicionar</button>
            </form>
            <div className="card">
              <div className="card-header" onClick={() => { setisActiveTaskOpen(prev => !prev) }}>
                <FaList />
                <span>  ACTIVE TASK </span>
                <span className="badge rounded-pill text-bg-primary">{activeTasks.length}</span>
              </div>
              {isActiveTaskOpen &&(<div className="card-body">
                {activeTasks.length === 0 ? (

                  <p className="task">Nenhuma task criada ainda</p>

                ) : (
                  activeTasks.map(task => (
                    <div className="task" key={task.id}>
                      <input className="task-check" type="checkbox" checked={!!task.completed}
                        onChange={() => toggleTask(task.id, task.completed)} />
                      <p
                        style={{
                          textAlign: "center",
                          textDecoration: task.completed ? "line-through" : "none"
                        }}
                      >
                        {task.title}
                      </p>
                      <button className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                      >
                        X
                      </button>
                    </div>
                  ))
                )}

              </div>)}
            </div>

            {completedTasks.length>0 &&(<div className="card task-concluidas">
              <div className="card-header" onClick={()=>{setisConcludedTaskOpen(prev=>!prev)}}><FaList /><span>CONCLUIDAS</span>
              <span className="badge rounded-pill text-bg-primary">{completedTasks.length}</span></div>
              
              {isConcludedTaskOpen&&(<div className="card-body">
                {(completedTasks.map(task => (
                    <div className="task" key={task.id}>
                      <input className="task-check" type="checkbox" checked={!!task.completed}
                        onChange={() => toggleTask(task.id, task.completed)} />
                      <p
                        style={{
                          textAlign: "center",
                          textDecoration: task.completed ? "line-through" : "none"
                        }}
                      >
                        {task.title}
                      </p>
                      <button className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                      >
                        <RiDeleteBin7Fill />
                      </button>
                    </div>
                  )))}
              </div>)}
            </div>)}

          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Menu
