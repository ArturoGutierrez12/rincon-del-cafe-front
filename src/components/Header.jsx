import { useState } from 'react'
import { Link } from 'react-router'
import { Iconocarrito } from './iconCarrito.jsx'
import { useAuth } from '../context/AuthContext.jsx'


export function Header({ totalItems, onToggleCarrito }) {
  // dentro del componente, junto a donde ya lees usuario
     const [menuAbierto, setMenuAbierto] = useState(false)
     const cerrarMenu = () => setMenuAbierto(false)
     const { usuario, logout } = useAuth()
     const esAdmin = usuario?.rol === "administrador" // ← ajusta esta línea, ver nota abajo

  return (
    <header>
      <div className="logo">El Rincón del Café</div>
      <button className="nav-toggle" onClick={() => setMenuAbierto(!menuAbierto)}>
        ☰
      </button>
      <nav className={menuAbierto ? 'open' : ''}>
        <a href="#inicio" onClick={cerrarMenu}>Inicio</a>
        <a href="#video" onClick={cerrarMenu}>Video</a>
        <a href="#menu" onClick={cerrarMenu}>Menú</a>
        <a href="#contacto" onClick={cerrarMenu}>Contacto</a>

        <button className="cart-toggle" onClick={onToggleCarrito}>
          <Iconocarrito />
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
        {esAdmin && (
  <Link to="/admin" className="btn-admin" onClick={cerrarMenu}>
    ⚙️ Panel admin
  </Link>
)}

{usuario ? (
  <>
    <span className="header-usuario" title={usuario.usuario}>
      {usuario.usuario}
    </span>
    <button className="btn-salir" onClick={logout}>Salir</button>
  </>
) : (
  <Link to="/login" className="cart-toggle" aria-label="Iniciar sesión" onClick={cerrarMenu}>
    <img src="/user.svg" className="acc" alt="Cuenta" />
  </Link>
)}
      </nav>
    </header>
  )
}
