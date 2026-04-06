import { useEffect, useState } from "react"
import { Sidebar } from "../assets/sidebar"
import { Footer } from "../assets/Footer"
import { Topbar } from "../assets/Topbar"
import { getToken } from "../services/utils/auth"

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
}

export function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchUsers = async () => {
    const token = getToken()

    if (!token) {
      setError("Sessão expirada. Faça login novamente.")
      setLoading(false)
      return
    }

    try {
      setError("")

      const res = await fetch("http://localhost:5000/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Não foi possível carregar os usuários.")
      }

      const data = await res.json()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (err) {
      setError(err.message || "Erro ao carregar usuários.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingUserId(null)
    setIsFormOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreate = () => {
    setEditingUserId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const handleEdit = (user) => {
    setEditingUserId(user.id)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = getToken()
    const isEditing = Boolean(editingUserId)
    const endpoint = isEditing
      ? `http://localhost:5000/auth/users/${editingUserId}`
      : "http://localhost:5000/auth/users"
    const method = isEditing ? "PUT" : "POST"

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    }

    if (formData.password.trim()) {
      payload.password = formData.password
    }

    try {
      setError("")

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(
          isEditing
            ? "Não foi possível atualizar o usuário."
            : "Não foi possível criar o usuário."
        )
      }

      await fetchUsers()
      resetForm()
    } catch (err) {
      setError(err.message || "Erro ao salvar usuário.")
    }
  }

  const handleDelete = async (userId) => {
    const token = getToken()

    try {
      setError("")

      const res = await fetch(`http://localhost:5000/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Não foi possível excluir o usuário.")
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (err) {
      setError(err.message || "Erro ao excluir usuário.")
    }
  }

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) return true

    return (
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch) ||
      user.role?.toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <div>
      <div className="layout">
        <Sidebar />

        <div className="mainframe">
          <Topbar />

          <main style={{ padding: "0 50px 80px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1 style={{ margin: 0 }}>Menu Administrador</h1>
                <p style={{ opacity: 0.8 }}>
                  Gerencie usuários, cargos e acessos do sistema.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreate}
              >
                Novo usuário
              </button>
            </div>

            <div className="card" style={{ margin: 0, marginBottom: "24px" }}>
              <div
                className="card-body"
                style={{ padding: "24px", display: "grid", gap: "16px" }}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou cargo..."
                  style={{ marginTop: 0, width: "100%" }}
                />

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {isFormOpen && (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "grid",
                      gap: "12px",
                      background: "rgba(255,255,255,0.04)",
                      padding: "20px",
                      borderRadius: "14px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      {editingUserId ? "Editar usuário" : "Criar usuário"}
                    </h3>

                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nome"
                      required
                      style={{ marginTop: 0, width: "100%" }}
                    />

                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      style={{ marginTop: 0, width: "100%" }}
                    />

                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        editingUserId
                          ? "Nova senha (opcional)"
                          : "Senha"
                      }
                      required={!editingUserId}
                      style={{ marginTop: 0, width: "100%" }}
                    />

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      style={{
                        height: "40px",
                        borderRadius: "15px",
                        padding: "0 1rem",
                        border: 0,
                      }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button type="submit" className="btn btn-success">
                        {editingUserId ? "Salvar alterações" : "Criar usuário"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <div style={{ overflowX: "auto" }}>
                  <table className="table table-hover align-middle myTable">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6">Carregando usuários...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6">Nenhum usuário encontrado.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge text-bg-primary">
                                {user.role}
                              </span>
                            </td>
                            <td>
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                    "pt-BR"
                                  )
                                : "-"}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleEdit(user)}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
