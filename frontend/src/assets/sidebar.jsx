import { FaTasks, FaUser } from "react-icons/fa";
import { TfiBarChart } from "react-icons/tfi";
import { NavLink } from "react-router-dom"

export function Sidebar(){
    return(
        <div className="Sidebar-root">
            <header className="acrylic sideHeader">
                <img width='40px'src="./src/assets/logo.svg" alt="Logo" />
                <h3>TASKFLOW</h3>
            </header>
            <div className="Sidebar">
                <NavLink
                to={"/menu"}
                className= {({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    <i className="icon"><FaTasks/></i><p>Tasks</p>
                </NavLink>
                <NavLink
                to={"/dashboard"}
                className= {({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><i className="icon"><TfiBarChart/></i>Dashboard</NavLink>
                
                (<NavLink
                to={"/admin"}
                className= {({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><i className="icon"><FaUser/></i>Admin</NavLink>
                )
            </div>
        </div>
    )
}