import Dropdown from 'react-bootstrap/Dropdown';
import { MdOutlineLogout } from "react-icons/md";


export function Topbar({user,logout}){
    return(
<header className="acrylic main-header">
    <Dropdown>
    <Dropdown.Toggle className="inputDropdow" id="dropdown-basic">
    <img className="pfp"src="./src/assets/pfp.jpg" alt="Profile-Pic" />
    <p>{user}</p>
    </Dropdown.Toggle>
    <Dropdown.Menu className="custom-menu">
    <Dropdown.Item className="custom-item">Apagar Conta</Dropdown.Item>
    <Dropdown.Item className="custom-item" onClick={logout}>Logout <MdOutlineLogout /></Dropdown.Item>
    </Dropdown.Menu>
    </Dropdown>
</header>
    )
}
