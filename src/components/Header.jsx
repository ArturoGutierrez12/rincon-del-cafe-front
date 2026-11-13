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

    {/* Siempre visible: carrito + hamburguesa */}
    <div className="header-acciones">
      <button className="cart-toggle" onClick={onToggleCarrito} aria-label="Abrir carrito">
        <Iconocarrito />
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </button>
      <button
        className="nav-toggle"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Menú"
        aria-expanded={menuAbierto}
      >
        ☰
      </button>
    </div>

    <nav className={menuAbierto ? 'open' : ''}>
      <a href="#inicio" onClick={cerrarMenu}>Inicio</a>
      <a href="#video" onClick={cerrarMenu}>Video</a>
      <a href="#menu" onClick={cerrarMenu}>Menú</a>
      <a href="#contacto" onClick={cerrarMenu}>Contacto</a>

      {esAdmin && (
        <Link to="/admin" className="btn-admin" onClick={cerrarMenu}>
          ⚙️ Panel admin
        </Link>
      )}

      {usuario ? (
        <>
          <span className="header-usuario" title={usuario.nombre}>{usuario.nombre}</span>
          <button className="btn-salir" onClick={logout}>Logout</button>
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
