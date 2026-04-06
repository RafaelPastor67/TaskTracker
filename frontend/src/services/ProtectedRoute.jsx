import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { API_URL } from "./api"

function PrivateRoute({ children, requireAdmin = false }) {
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setStatus("unauthorized")
      return
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          setStatus("unauthorized")
          return
        }

        const data = await res.json()

        if (requireAdmin && data.user.role !== "admin") {
          setStatus("forbidden")
          return
        }

        setStatus("authorized")
      })
      .catch(() => setStatus("unauthorized"))
  }, [requireAdmin])

  if (status === "loading") return <p>Loading...</p>

  if (status === "unauthorized") {
    return <Navigate to="/" replace />
  }

  if (status === "forbidden") {
    return <Navigate to="/projects" replace />
  }

  return children
}

export default PrivateRoute
