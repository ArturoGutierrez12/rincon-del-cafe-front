import { useState, useRef, useEffect } from 'react'
import 'react-aframe-ar'
import './App.css'
import { Iconocarrito } from './components/iconCarrito.jsx'
import { CarritoLateral } from './carrito.jsx'
import {Modal3D} from './components/modal3D.jsx'
import 'aframe'
import { HeroModelo3D } from './components/HeroModelo3D.jsx'
import CafeteriaVR from './components/CafeteriaVR.jsx'
import { Link } from 'react-router'
import { Header } from './components/Header.jsx'
import { useCarrito } from './context/CarritoContext.jsx'
import { evento, itemGA } from './analytics.js'


// Misma info de categorías del HTML. Las llaves deben coincidir con
// el valor del campo `categoria` de tus productos.

/*
 
const categorias = {
  origen:    { label: 'Cafés por origen',       icon: '☕',  accent: '#3B2415' },
  especial:  { label: 'Cafés especiales',       icon: '✨',  accent: '#6F4E37' },
  metodo:    { label: 'Métodos de preparación', icon: '⚙️', accent: '#8B5E3C' },
  accesorio: { label: 'Accesorios',             icon: '🫖',  accent: '#C9A574' },
}
*/
const categorias = {
  1:    { label: 'Cafés por origen',       icon: '☕',  accent: '#3B2415' },
  2:  { label: 'Cafés especiales',       icon: '✨',  accent: '#6F4E37' },
  3:    { label: 'Métodos de preparación', icon: '⚙️', accent: '#8B5E3C' },
  4: { label: 'Accesorios',             icon: '🫖',  accent: '#C9A574' },
}

// Campos esperados por producto: id, nombre, descripcion, precio, categoria
function TarjetaProducto({ producto, onVer3D, onAgregar }) {
  const info = categorias[producto.id_categoria]

  return (
    <div className="card" style={{ '--accent': info.accent }}>
      <div className="card-visual">
        <span className="card-badge">{info.label}/</span>
        <img src={`/PRODUCTOS/${producto.id_categoria}/${producto.id_producto}.png`} />
        
      </div>
      <div className="card-body">
        <h3>{producto.nombre}</h3>
        <p>{producto.descripcion}</p>
        <div className="card-foot">
          <span className="price">${producto.precio}</span>
           <button className="view3d" onClick={() => onVer3D(producto)}>
            Info.
          </button>
          <button className="add-to-cart" onClick={() => onAgregar(producto)}>
            🛒 Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inicio() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [reproduciendo, setReproduciendo] = useState(false)
  const [productoActivo, setProductoActivo] = useState(null) // producto abierto en el modal 3D
  const [carritoAbierto, setCarritoAbierto] = useState(false) // 1. estado que faltaba
  const videoRef = useRef(null)
const { carrito, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, totalItems } = useCarrito()
  const [productos, setProductos] = useState([])
  useEffect(() => {
    fetch("https://api.rincondelcafe.tech/api/productos/listar.php", {
      credentials: "include"
      })
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error al obtener productos:', error))
  }, [])
const verProducto = (p) => {
  evento('view_item', { currency: 'MXN', value: Number(p.precio), items: [itemGA(p)] })
  setProductoActivo(p)
}

const agregar = (p) => {
  evento('add_to_cart', { currency: 'MXN', value: Number(p.precio), items: [itemGA(p)] })
  agregarAlCarrito(p)
}
  const visibles =
    categoriaActiva === 'todos'
      ? productos
      : productos.filter((p) => p.id_categoria === categoriaActiva)

  const reproducir = () => {
    setReproduciendo(true)
    videoRef.current?.play().catch(() => {})
  }


  const cerrarMenu = () => setMenuAbierto(false)
  const ESCALA = '1 1 1'
  return (
    <>
      {/* Header */}
      <Header
     totalItems={totalItems}
     onToggleCarrito={() => setCarritoAbierto(!carritoAbierto)}
   />

      {/* 2. Carrito lateral: se monta/desmonta según carritoAbierto */}
      {carritoAbierto && (
        <CarritoLateral
          carrito={carrito}
          cambiarCantidad={cambiarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          onClose={() => setCarritoAbierto(false)}
        />
      )}
      

      {/* Hero */}
      <section className="hero" id="inicio">
        <h1>Aroma, tradición<br />y origen mexicano</h1>
        <p>
          Descubre granos de las regiones cafetaleras de México, métodos de
          preparación y accesorios — y recorre nuestra cafetería en un entorno
          virtual 3D.
        </p>
        <div className="hero-ctas">
          <a href="#menu" className="btn btn-gold">Explorar menú</a>
          <a href="#vr" className="btn btn-outline">Visitar cafetería virtual</a>
        </div>
        <p className="hero-proof">★★★★★ 4.9/5 · más de 500 tazas servidas cada semana</p>
        
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <span className="f-ico" style={{ '--accent': 'var(--brown)' }}>🌱</span>
          <div><h4>100% orgánico</h4><p>Cultivo sostenible, sin químicos.</p></div>
        </div>
        <div className="feature">
          <span className="f-ico" style={{ '--accent': 'var(--gold)' }}>🚚</span>
          <div><h4>Directo del productor</h4><p>De la finca a tu taza.</p></div>
        </div>
        <div className="feature">
          <span className="f-ico" style={{ '--accent': 'var(--sage)' }}>🔥</span>
          <div><h4>Tueste artesanal</h4><p>Lotes pequeños cada semana.</p></div>
        </div>
        <div className="feature">
          <span className="f-ico" style={{ '--accent': 'var(--rust)' }}>🇲🇽</span>
          <div><h4>Origen mexicano</h4><p>10 regiones cafetaleras del país.</p></div>
        </div>
      </section>

      {/* Video */}
      <section id="video">
        <div className="section-head">
          <h2>Nuestra historia en video</h2>
          <p>Del cafetal a tu taza: mira el spot de El Rincón del Café.</p>
        </div>

        {!reproduciendo && (
          <div className="video-frame">
            <button className="play-btn" aria-label="Reproducir video" onClick={reproducir}>
              ▶
            </button>
            <span className="video-caption">El Rincón del Café · Spot 2026 · 0:45</span>
          </div>
        )}

        <video
          id="adVideo"
          ref={videoRef}
          src="/video/videor.mp4#t=0.1"
          poster="/EMPRESA.png" 
          preload="metadata" 
          playsInline
          controls
          style={{ display: reproduciendo ? 'block' : 'none' }}
        >
          
          Tu navegador no soporta video HTML5. 
        </video>
      </section>

      {/* Catálogo */}
      <section id="menu">
        <div className="section-head">
          <h2>Nuestro catálogo</h2>
          <p>
            {productos.length} productos en {Object.keys(categorias).length} categorías.
            Toca "Ver en 3D" para inspeccionarlos de cerca.
          </p>
        </div>

        <div className="tabs">
          {['todos', ...Object.keys(categorias)].map((cat) => (
            <button
              key={cat}
              className={`tab${cat === categoriaActiva ? ' active' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat === 'todos' ? 'Todos' : categorias[cat].label}
            </button>
          ))}
        </div>

        <div className="grid">
          {visibles.map((producto) => (
            <TarjetaProducto
              key={producto.id_producto}
              producto={producto}
              onVer3D={verProducto}   // antes: setProductoActivo
              onAgregar={agregar}     // antes: agregarAlCarrito
            />
          ))}
        </div>
      </section>

      {/* Cafetería virtual */}
      <section id="vr">
        <div className="section-head">
          <h2>Cafetería virtual</h2>
          <p>
            Explora nuestro espacio en 3D — usa las flechas/WASD y arrastra el
            mouse para mirar alrededor.
          </p>
        </div>
        <div className="vr-wrap">
          <span className="vr-hint">🖱️ Arrastra para mirar · WASD para caminar</span>
          {/* <CafeteriaVR /> */}
        </div>
      </section>

      {/* Modal 3D: se abre cuando productoActivo tiene un producto */}
      {productoActivo && (
      <Modal3D producto={productoActivo} onClose={() => setProductoActivo(null)} />
      )}
      <div className="vr-wrap">
  <span className="vr-hint">🖱️ Arrastra para mirar · WASD para caminar</span>
    <CafeteriaVR />
  </div>

      {/* Footer */}
      <footer id="contacto">
        <div className="foot-grid">
          <div>
            <h4>El Rincón del Café</h4>
            <p>Café de especialidad mexicano, tostado en lotes pequeños desde 2019.</p>
          </div>
          <div>
            <h4>Horarios</h4>
            <p>Lun–Vie: 7:00–21:00<br />Sáb–Dom: 8:00–22:00</p>
          </div>
          <div>
            <h4>Ubicación</h4>
            <p>Av. del Café 145, Col. Centro<br />Ciudad de México</p>
          </div>
          <div>
            <h4>Síguenos</h4>
            <p>
              <a href="#">Instagram</a><br />
              <a href="#">Facebook</a><br />
              <a href="#">TikTok</a>
            </p>
          </div>
          <div>
            <h4>¡Llamanos para recibir novedades!</h4>
              <p>+52 5536619768</p>
          </div>
        </div>
        <div className="foot-bottom">
          © 2026 El Rincón del Café. Todos los derechos reservados.
        </div>
      </footer>


    </>
  
  )
}
