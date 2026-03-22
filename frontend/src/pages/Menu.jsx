import { useNavigate } from "react-router-dom"

function Menu() {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div>

      <h1>Você está logado</h1>

      <button onClick={logout}>
        Logout
      </button>
      
    </div>
  )
}

export default Menu