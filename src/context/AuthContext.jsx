import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const CLAVE = 'usuario'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CLAVE)) } catch { return null }
  })

  const login = (datos) => {
    setUsuario(datos)
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)) } catch { /* sin storage */ }
  }

  const logout = () => {
    setUsuario(null)
    try { localStorage.removeItem(CLAVE) } catch { /* sin storage */ }
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}