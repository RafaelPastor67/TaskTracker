import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Menu from "./pages/Menu"
import ProtectedRoute from "./services/ProtectedRoute"
import Register from "./pages/Register"
import { Admin } from "./pages/Admin"
import { Dashboard } from "./pages/Dashboard"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin"
        element={
          <ProtectedRoute>
            <Admin/>
          </ProtectedRoute>
        }
        />


      </Routes>
    </BrowserRouter>
  )
}

export default App