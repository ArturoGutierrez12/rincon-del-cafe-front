// src/components/HeroModelo3D.jsx
// Objeto 3D giratorio para el hero de la página principal.
import 'aframe'

// === Configuración: cambia aquí qué modelo se muestra ===
const RAIZ = '/objetos3d' // = public/objetos3d
const MODELO = { carpeta: 'Cafes de origen', id: 1 } // archivos: 1.obj y 1.mtl
const ESCALA = '1 1 1' // si sale enorme o diminuto, prueba 0.01 o 100

export function HeroModelo3D() {
  // encodeURI convierte los espacios de la carpeta en %20
  const base = encodeURI(`${RAIZ}/${MODELO.carpeta}`)
  

  return (
    // aria-hidden: es decorativo, los lectores de pantalla no necesitan leerlo
    <div className="hero-3d" aria-hidden="true">
      <a-scene
        embedded
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        background="transparent: true"
        renderer="alpha: true"
      >
        <a-entity
          obj-model={`obj: url(/objetos3d/Cafes de origen/2.obj); mtl: url(/objetos3d/Cafes de origen/2.mtl)`}
          position="0 0.4 0"
          scale={ESCALA}
          animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
        ></a-entity>

        <a-entity light="type: ambient; intensity: 0.7"></a-entity>
        <a-entity light="type: directional; intensity: 0.9; color: #FFDCA8" position="1 2 1"></a-entity>

        <a-entity camera position="0 1 3"></a-entity>
      </a-scene>
    </div>
  )
}

