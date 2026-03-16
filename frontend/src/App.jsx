import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Menu from "./pages/Menu"
import ProtectedRoute from "./services/ProtectedRoute"
import Register from "./pages/Register"

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

      </Routes>
    </BrowserRouter>
  )
}

export default App