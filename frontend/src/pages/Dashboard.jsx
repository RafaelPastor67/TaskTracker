import { Sidebar } from "../assets/sidebar"
import { Footer } from "../assets/Footer"
import { Topbar } from "../assets/Topbar"

export function Dashboard(){
    return(
        <div>
            <div className="layout">
                <Sidebar/>

                <div className="mainframe">
                <Topbar/>
                
                </div>
                
            </div>
            <Footer/>
        </div>
    )
}