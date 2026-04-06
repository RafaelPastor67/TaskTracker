import Dropdown from 'react-bootstrap/Dropdown';
import { MdOutlineLogout } from "react-icons/md";
import { getToken,decodeUser,clearToken } from '../services/utils/auth';
import { useNavigate } from 'react-router-dom';


export function Topbar(){
    const navigate = useNavigate()
    const token = getToken()
    const user = decodeUser(token)
    
    const handleDeleteAccount = async () => {
  if (!token) return

  const payload = JSON.parse(atob(token.split(".")[1]))
  const userId = payload.id

  const confirmed = window.confirm("Tem certeza que deseja apagar sua conta?")
  if (!confirmed) return

  try {
    const res = await fetch(`http://localhost:5000/auth/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error("Não foi possível apagar a conta")
    }

    clearToken()
    navigate("/")
  } catch (err) {
    console.error(err)
    alert("Erro ao apagar conta")
  }
}


const logout = ()=> 
{
    clearToken()
    navigate('/')
}

    return(
<header className="acrylic main-header">
    <Dropdown>
    <Dropdown.Toggle className="inputDropdow" id="dropdown-basic">
    <img className="pfp"src="./src/assets/pfp.jpg" alt="Profile-Pic" />
    <p>{user}</p>
    </Dropdown.Toggle>
    <Dropdown.Menu className="custom-menu">
    <Dropdown.Item className="custom-item" onClick={handleDeleteAccount}>Apagar Conta</Dropdown.Item>
    <Dropdown.Item className="custom-item" onClick={logout}>Logout <MdOutlineLogout /></Dropdown.Item>
    </Dropdown.Menu>
    </Dropdown>
</header>
    )
}
