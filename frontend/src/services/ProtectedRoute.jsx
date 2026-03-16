import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

function PrivateRoute({ children }) {

  const [status, setStatus] = useState("loading")

  useEffect(() => {

    const token = localStorage.getItem("token")

    if (!token) {
      setStatus("unauthorized")
      return
    }

    fetch("http://localhost:5000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) setStatus("authorized")
      else setStatus("unauthorized")
    })
    .catch(() => setStatus("unauthorized"))

  }, [])

  if (status === "loading") return <p>Loading...</p>

  if (status === "unauthorized") {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute