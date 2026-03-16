import React from "react"
import { Link } from "react-router-dom"

async function handleLogin(email, password) {
  try {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Email ou senha incorretos")
      return
    }

    localStorage.setItem("token", data.token)

    window.location.href = "/menu"

  } catch (error) {
    console.error("Erro ao fazer login:", error)
    alert("Erro de conexão com o servidor")
  }
}

function Login() {

  const handleSubmit = async (e) => {
    e.preventDefault()

    const email = e.target.email.value
    const password = e.target.password.value

    await handleLogin(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
        <h1>Login</h1>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Senha" />
      <button type="submit">Login</button>
      <Link to="/register">Não possui conta? Registre aqui</Link>
    </form>
  )
}

export default Login