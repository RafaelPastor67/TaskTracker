import Dropdown from "react-bootstrap/Dropdown"
import { MdOutlineLogout } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import pfp from "./pfp.jpg"
import { API_URL } from "../services/api"
import { clearToken, decodeToken, decodeUser, getToken } from "../services/utils/auth"

export function Topbar() {
  const navigate = useNavigate()
  const token = getToken()
  const user = decodeUser(token)

  const handleDeleteAccount = async () => {
    if (!token) return

    const payload = decodeToken(token)
    const userId = payload?.id

    if (!userId) return

    const confirmed = window.confirm("Tem certeza que deseja apagar sua conta?")
    if (!confirmed) return

    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Nao foi possivel apagar a conta")
      }

      clearToken()
      navigate("/")
    } catch (err) {
      console.error(err)
      alert("Erro ao apagar conta")
    }
  }

  const logout = () => {
    clearToken()
    navigate("/")
  }

  return (
    <header className="acrylic main-header">
      <Dropdown>
        <Dropdown.Toggle className="inputDropdow" id="dropdown-basic">
          <img className="pfp" src={pfp} alt="Profile-Pic" />
          <p>{user}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu className="custom-menu">
          <Dropdown.Item className="custom-item" onClick={handleDeleteAccount}>
            Apagar Conta
          </Dropdown.Item>
          <Dropdown.Item className="custom-item" onClick={logout}>
            Logout <MdOutlineLogout />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  )
}
