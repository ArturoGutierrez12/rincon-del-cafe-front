
import { useEffect, useRef, useState } from 'react'
import 'aframe';
 
// === Configuración: si cambian tus carpetas o nombres, solo toca esto ===
const RAIZ = '/objetos3d' // = public/objetos3d
const CARPETAS = {
  1: 'Cafes de origen',
  2: 'Cafes de origen',
  3: 'Cafes de origen',
  4: 'Cafes de origen',
  5: 'Cafes de origen',
  6: 'Cafes de origen',
  7: 'Cafes de origen'
  // 2: 'nombre de la carpeta de la categoría 2',
  // 3: '...',
  // 4: '...',
}
const ESCALA = '1 1 1' // si el modelo sale enorme o diminuto, prueba 0.01 o 100
 
export function Modal3D({ producto, onClose }) {
  const id = producto.id_producto
  const carpeta = CARPETAS[producto.id_categoria] ?? producto.id_categoria
  // encodeURI convierte los espacios en %20 para que la URL sea válida
  const base = encodeURI(`${RAIZ}/${carpeta}`)
  const rutaOBJ = `${base}/${id}.obj`
  const rutaMTL = `${base}/${id}.mtl`
 
  const entidadRef = useRef(null)
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'listo' | 'error'
 
  // Cerrar con la tecla Escape
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onClose])
 
  // A-Frame avisa con eventos si el modelo cargó o falló
  useEffect(() => {
    const el = entidadRef.current
    if (!el) return
 
    const alCargar = () => setEstado('listo')
    const alFallar = (e) => {
      console.error('No se pudo cargar el modelo 3D:', e.detail)
      setEstado('error')
    }
 
    el.addEventListener('model-loaded', alCargar)
    el.addEventListener('model-error', alFallar)
    return () => {
      el.removeEventListener('model-loaded', alCargar)
      el.removeEventListener('model-error', alFallar)
    }
  }, [])
 
  return (
    // Clic fuera del panel cierra el modal
    <div className="modal3d-overlay" onClick={onClose}>
      {/* stopPropagation evita que un clic DENTRO del panel también lo cierre */}
      <div
        className="modal3d-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal3d-header">
          <h3>{producto.nombre}</h3>
          <button onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
 
        {estado === 'cargando' && <p className="modal3d-estado">Cargando modelo…</p>}
        {estado === 'error' && (
          <p className="modal3d-estado">
            No se pudo cargar el modelo. Archivo buscado: {rutaOBJ}
          </p>
        )}
 
        {/* key={id}: si cambia el producto, React desmonta y monta la escena de nuevo */}
        <a-scene key={id} embedded vr-mode-ui="enabled: false" background="color: #e7e7e7">
          {/* Prueba rápida: descomenta para confirmar que la escena funciona sin el modelo */}
          {/* <a-box color="red" position="0 0.5 -2"></a-box> */}
 
          <a-entity
            ref={entidadRef}
            obj-model={`obj: url(${rutaOBJ}); mtl: url(${rutaMTL})`}
            position="0 0.5 0"
            scale={ESCALA}
            animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear"
          ></a-entity>
 
          <a-entity light="type: ambient; intensity: 0.6"></a-entity>
          <a-entity light="type: directional; intensity: 0.3" position="1 2 1"></a-entity>
 
          <a-entity camera position="0 1 3"></a-entity>
        </a-scene>
      </div>
    </div>
  )
}
