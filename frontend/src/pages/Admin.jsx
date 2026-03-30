import { Sidebar } from "../assets/sidebar"
import { Footer } from "../assets/Footer"
import { Topbar } from "../assets/Topbar"

export function Admin(){
    return(
<div>
    <div className="layout">
        <Sidebar/>

        <div className="mainframe">
        <Topbar/>
        <h1 style={{marginLeft:"50px"}}>ADMINISTRADOR ESTA ONLINE</h1>
        </div>

    </div>
    <Footer/>
</div>
)
}