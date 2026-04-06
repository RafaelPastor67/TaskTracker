export const getToken = () => localStorage.getItem("token")

export const decodeUser = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.name
    } catch {
        return null
    }
}

export const clearToken = () => localStorage.removeItem("token")

