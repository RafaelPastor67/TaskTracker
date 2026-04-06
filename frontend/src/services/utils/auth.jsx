export const getToken = () => localStorage.getItem("token")

export const decodeToken = (token) => {
  if (!token) return null

  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

export const decodeUser = (token) => decodeToken(token)?.name ?? null

export const decodeRole = (token) => decodeToken(token)?.role ?? null

export const clearToken = () => localStorage.removeItem("token")
