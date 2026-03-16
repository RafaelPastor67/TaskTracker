import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Register() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e) => {

    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Erro ao registrar")
      }

      // após registrar, voltar para login
      navigate("/")

    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div>

      <h1>Register</h1>

      <form onSubmit={handleRegister}>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>

      </form>

      {error && <p>{error}</p>}

      <p>
        Já tem conta? <Link to="/">Login</Link>
      </p>

    </div>
  )
}

export default Register