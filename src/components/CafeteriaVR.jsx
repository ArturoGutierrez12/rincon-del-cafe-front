import { useEffect } from 'react'
import 'aframe'

/*
  Componente A-Frame "cafe-walk" (port del HTML original).
  Cambios respecto al original:
   - Se registra una sola vez (protección contra recargas de Vite/StrictMode).
   - Las teclas SOLO se capturan cuando el mouse está sobre la escena o el
     puntero está bloqueado. Así las flechas no bloquean el scroll de la página
     ni se interfiere al escribir en el input del newsletter.
   - Los colliders y la cámara se buscan dentro de la escena, no en document.
*/
const AFRAME = window.AFRAME
const THREE = window.AFRAME.THREE

if (!AFRAME.components['cafe-walk']) {
  AFRAME.registerComponent('cafe-walk', {
    schema: {
      speed: { type: 'number', default: 2.2 },
      runMultiplier: { type: 'number', default: 1.65 },
      radius: { type: 'number', default: 0.3 },
      minX: { type: 'number', default: -8.2 },
      maxX: { type: 'number', default: 8.2 },
      minZ: { type: 'number', default: -7.2 },
      maxZ: { type: 'number', default: 7.2 },
    },

    init: function () {
      this.keys = {}
      this.colliders = []
      this.active = false
      this.hover = false
      this.locked = false
      this.tmpBox = new THREE.Box3()
      this.playerBox = new THREE.Box3()
      this.direction = new THREE.Vector3()
      this.right = new THREE.Vector3()

      const scene = this.el.sceneEl

      const updateActive = () => {
        this.active = this.hover || this.locked
        if (!this.active) this.keys = {}
      }

      this.onEnter = () => { this.hover = true; updateActive() }
      this.onLeave = () => { this.hover = false; updateActive() }
      this.onLockChange = () => {
        this.locked = !!document.pointerLockElement
        updateActive()
      }

      this.onKeyDown = (e) => {
        if (!this.active) return
        const k = e.code
        if (
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
           'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(k)
        ) {
          e.preventDefault()
          this.keys[k] = true
        }
      }

      this.onKeyUp = (e) => {
        this.keys[e.code] = false
      }

      this.refreshColliders = () => {
        this.colliders = Array.from(scene.querySelectorAll('.collider'))
      }

      scene.addEventListener('mouseenter', this.onEnter)
      scene.addEventListener('mouseleave', this.onLeave)
      document.addEventListener('pointerlockchange', this.onLockChange)
      window.addEventListener('keydown', this.onKeyDown, { passive: false })
      window.addEventListener('keyup', this.onKeyUp)

      if (scene.hasLoaded) this.refreshColliders()
      else scene.addEventListener('loaded', this.refreshColliders)
    },

    remove: function () {
      const scene = this.el.sceneEl
      scene.removeEventListener('mouseenter', this.onEnter)
      scene.removeEventListener('mouseleave', this.onLeave)
      scene.removeEventListener('loaded', this.refreshColliders)
      document.removeEventListener('pointerlockchange', this.onLockChange)
      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('keyup', this.onKeyUp)
    },

    isBlocked: function (pos) {
      const r = this.data.radius

      // Caja del jugador, desde "pies" hasta casi la cabeza.
      this.playerBox.min.set(pos.x - r, 0.05, pos.z - r)
      this.playerBox.max.set(pos.x + r, 1.75, pos.z + r)

      for (const el of this.colliders) {
        const obj = el.object3D
        if (!obj || !obj.visible) continue

        this.tmpBox.setFromObject(obj)
        this.tmpBox.min.y = Math.max(this.tmpBox.min.y, 0.0)
        this.tmpBox.max.y = Math.min(this.tmpBox.max.y, 2.2)

        if (this.playerBox.intersectsBox(this.tmpBox)) return true
      }
      return false
    },

    tick: function (time, delta) {
      if (!delta || !this.active) return

      const dt = Math.min(delta / 1000, 0.05)
      const forwardPressed = this.keys['ArrowDown'] || this.keys['KeyS']
      const backPressed = this.keys['ArrowUp'] || this.keys['KeyW']
      const leftPressed = this.keys['ArrowLeft'] || this.keys['KeyA']
      const rightPressed = this.keys['ArrowRight'] || this.keys['KeyD']

      if (!forwardPressed && !backPressed && !leftPressed && !rightPressed) return

      const camera = this.el.querySelector('#camera')
      if (!camera) return

      // Dirección horizontal basada en hacia dónde mira la cámara.
      camera.object3D.getWorldDirection(this.direction)
      this.direction.y = 0
      if (this.direction.lengthSq() === 0) this.direction.set(0, 0, -1)
      this.direction.normalize()

      this.right.set(this.direction.z, 0, -this.direction.x).normalize()

      let moveX = 0
      let moveZ = 0

      if (forwardPressed) { moveX += this.direction.x; moveZ += this.direction.z }
      if (backPressed) { moveX -= this.direction.x; moveZ -= this.direction.z }
      if (leftPressed) { moveX -= this.right.x; moveZ -= this.right.z }
      if (rightPressed) { moveX += this.right.x; moveZ += this.right.z }

      const len = Math.hypot(moveX, moveZ)
      if (len > 0) { moveX /= len; moveZ /= len }

      const running = this.keys['ShiftLeft'] || this.keys['ShiftRight']
      const speed = this.data.speed * (running ? this.data.runMultiplier : 1)

      const current = this.el.object3D.position.clone()

      // Resolver X y Z por separado permite deslizarse junto a muebles/paredes.
      const tryX = current.clone()
      tryX.x += moveX * speed * dt
      tryX.x = THREE.MathUtils.clamp(tryX.x, this.data.minX, this.data.maxX)
      if (!this.isBlocked(tryX)) this.el.object3D.position.x = tryX.x

      const tryZ = this.el.object3D.position.clone()
      tryZ.z += moveZ * speed * dt
      tryZ.z = THREE.MathUtils.clamp(tryZ.z, this.data.minZ, this.data.maxZ)
      if (!this.isBlocked(tryZ)) this.el.object3D.position.z = tryZ.z
    },
  })
}

const estiloContenedor = {
  position: 'relative',
  width: '100%',
  height: 'min(78vh, 640px)',
  padding: '3px',
  top: '-80px'
}

const estiloAyuda = {
  position: 'absolute',
  zIndex: 10,
  left: 16,
  bottom: 16,
  background: 'rgba(12, 22, 14, 0.82)',
  color: '#fff7e7',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 13,
  lineHeight: 1.45,
  pointerEvents: 'none',
  border: '1px solid rgba(255,255,255,.15)',
  maxWidth: 320,
}

export default function CafeteriaVR() {
  // Al desmontar, soltar el puntero si estaba bloqueado.
  useEffect(() => {
    return () => {
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [])

  return (
    <div style={estiloContenedor}>
      <div style={estiloAyuda}>
        <b style={{ color: '#f3d59b' }}>Recorrido virtual</b><br />
        Flechas o WASD: caminar<br />
        Mouse: mirar alrededor<br />
        Shift: caminar más rápido<br />
        Haz clic dentro de la escena para activar el mouse
      </div>

      <a-scene
        embedded
        style={{ width: '100%', height: '100%' }}
        background="color: #171512"
        renderer="antialias: true"
        shadow="type: pcfsoft"
      >
        {/* ILUMINACIÓN */}
        <a-entity light="type: ambient; color: #fff4dd; intensity: 0.55"></a-entity>
        <a-entity light="type: directional; color: #ffe8c7; intensity: 0.75"
                  position="-4 7 2" rotation="-55 -25 0"></a-entity>

        {/* Luces cálidas sobre barra */}
        <a-entity light="type: point; color: #ffd59a; intensity: 1.0; distance: 9"
                  position="1.2 4.4 -4.2"></a-entity>
        <a-entity light="type: point; color: #ffd59a; intensity: 0.75; distance: 7"
                  position="-4.5 4.0 -1.8"></a-entity>
        <a-entity light="type: point; color: #ffd59a; intensity: 0.7; distance: 7"
                  position="5.1 4.0 1.7"></a-entity>

        {/* JUGADOR / CÁMARA */}
        <a-entity id="player" position="0 0 5.3"
                  cafe-walk="speed: 2.25; radius: 0.32; minX: -8.1; maxX: 8.1; minZ: -7.0; maxZ: 7.0">
          <a-camera id="camera"
                    position="0 1.65 0"
                    look-controls="pointerLockEnabled: true"
                    wasd-controls-enabled="false">
          </a-camera>
        </a-entity>

        {/* HABITACIÓN */}
        {/* Piso */}
        <a-plane position="0 0 0" rotation="-90 0 0" width="18" height="16"
                 color="#8f5d38" material="roughness: 0.95; metalness: 0"></a-plane>

        {/* Tapete central */}
        <a-plane position="0 0.008 0.6" rotation="-90 0 0" width="5.4" height="2.2"
                 color="#d5c4a4" material="roughness: 1"></a-plane>

        {/* Techo */}
        <a-plane position="0 5.2 0" rotation="90 0 0" width="18" height="16" color="#4a2f1f"></a-plane>

        {/* Paredes */}
        <a-box className="collider" position="0 2.6 -7.6" width="18" height="5.2" depth="0.22" color="#f2e4cd"></a-box>
        <a-box className="collider" position="-8.6 2.6 0" width="0.22" height="5.2" depth="15.2" color="#efe1ca"></a-box>
        <a-box className="collider" position="8.6 2.6 0" width="0.22" height="5.2" depth="15.2" color="#efe1ca"></a-box>
        <a-box className="collider" position="-5.15 2.6 7.55" width="6.7" height="5.2" depth="0.22" color="#efe1ca"></a-box>
        <a-box className="collider" position="5.15 2.6 7.55" width="6.7" height="5.2" depth="0.22" color="#efe1ca"></a-box>

        {/* Muro verde de marca */}
        <a-box position="2.7 2.6 -7.44" width="8.0" height="5.0" depth="0.08" color="#1f4a36"></a-box>

        {/* Mural sepia */}
        <a-plane position="2.7 2.15 -7.38" width="7.1" height="2.1" color="#d8c6a7"></a-plane>
        <a-text value="MONTAÑAS  •  CAFÉ MEXICANO  •  RAÍCES"
                position="2.7 2.95 -7.30" align="center" color="#6c4c32" width="6.5"></a-text>
        <a-entity position="2.7 1.95 -7.28">
          <a-triangle vertex-a="-2.4 0 0" vertex-b="0 1.35 0" vertex-c="2.4 0 0" color="#8a6747"></a-triangle>
          <a-box position="0 -0.08 0.02" width="2.6" height="0.22" depth="0.03" color="#6e4a2d"></a-box>
          <a-box position="0 0.14 0.03" width="2.1" height="0.22" depth="0.03" color="#7b5433"></a-box>
          <a-box position="0 0.36 0.04" width="1.6" height="0.22" depth="0.03" color="#8a613c"></a-box>
          <a-box position="0 0.58 0.05" width="1.0" height="0.22" depth="0.03" color="#6e4a2d"></a-box>
        </a-entity>

        {/* Letrero de pared */}
        <a-text value="El Rincón\ndel Café"
                position="2.7 4.15 -7.25" align="center" color="#f4ead6" width="7.5"></a-text>

        {/* BARRA PRINCIPAL */}
        <a-box className="collider" position="1.6 0.65 -3.95" width="8.1" height="1.3" depth="1.55"
               color="#5a321f" shadow="cast: true; receive: true"></a-box>
        <a-box position="1.6 0.69 -3.12" width="8.0" height="1.12" depth="0.08" color="#6b3c24"></a-box>
        <a-box className="collider" position="1.6 1.34 -3.95" width="8.25" height="0.12" depth="1.7" color="#d7c5aa"></a-box>
        <a-text value="El Rincón del Café"
                position="1.6 0.78 -3.05" align="center" color="#f4ead6" width="4.8"></a-text>

        {/* Máquina espresso */}
        <a-box className="collider" position="-0.25 1.82 -4.05" width="2.2" height="0.85" depth="0.75"
               color="#777a77" material="metalness: 0.65; roughness: 0.3"></a-box>
        <a-box position="-0.25 2.12 -3.64" width="1.75" height="0.12" depth="0.06" color="#1f1f1f"></a-box>

        {/* Molino */}
        <a-cylinder className="collider" position="1.55 1.87 -4.02" radius="0.34" height="0.95" color="#242424"></a-cylinder>
        <a-cylinder position="1.55 2.55 -4.02" radius="0.42" height="0.7" color="#6d6254"
                    material="opacity: 0.72; transparent: true"></a-cylinder>

        {/* Vasos */}
        <a-cylinder position="2.55 1.63 -3.65" radius="0.16" height="0.42" color="#f6efe0"></a-cylinder>
        <a-cylinder position="2.9 1.63 -3.65" radius="0.16" height="0.42" color="#284d39"></a-cylinder>

        {/* Vitrina */}
        <a-box className="collider" position="5.55 1.18 -3.7" width="2.35" height="2.15" depth="1.2"
               color="#5b3b2b" material="opacity: 0.72; transparent: true"></a-box>
        <a-box position="5.55 0.68 -3.05" width="2.3" height="0.8" depth="0.08" color="#5f3621"></a-box>

        {/* Panes */}
        <a-torus position="5.1 1.55 -3.1" rotation="90 0 0" radius="0.22" radius-tubular="0.09" color="#c98c46"></a-torus>
        <a-torus position="5.65 1.55 -3.1" rotation="90 0 0" radius="0.22" radius-tubular="0.09" color="#c98c46"></a-torus>
        <a-torus position="6.15 1.55 -3.1" rotation="90 0 0" radius="0.22" radius-tubular="0.09" color="#c98c46"></a-torus>

        {/* MENÚS */}
        <a-plane position="-1.0 3.65 -7.31" width="2.1" height="2.4" color="#1e2922"></a-plane>
        <a-plane position="1.35 3.65 -7.31" width="2.1" height="2.4" color="#1e2922"></a-plane>
        <a-plane position="3.7 3.65 -7.31" width="2.1" height="2.4" color="#1e2922"></a-plane>

        <a-text value="CAFÉS\n\nEspresso\nAmericano\nLatte\nCappuccino\nMocha"
                position="-1.0 4.55 -7.20" align="center" color="#f6ead6" width="2.5"></a-text>
        <a-text value="BEBIDAS\n\nChocolate\nTé mexicano\nMatcha\nTisana\nCold Brew"
                position="1.35 4.55 -7.20" align="center" color="#f6ead6" width="2.5"></a-text>
        <a-text value="ALGO MÁS\n\nCroissant\nMuffin\nPan dulce\nPastel\nSándwich"
                position="3.7 4.55 -7.20" align="center" color="#f6ead6" width="2.5"></a-text>

        {/* ESTANTERÍA DE PRODUCTO */}
        <a-box className="collider" position="7.35 2.25 -5.35" width="1.8" height="4.5" depth="0.75" color="#5b3825"></a-box>

        <a-box position="7.35 1.0 -4.94" width="1.65" height="0.09" depth="0.62" color="#85563a"></a-box>
        <a-box position="7.35 2.05 -4.94" width="1.65" height="0.09" depth="0.62" color="#85563a"></a-box>
        <a-box position="7.35 3.1 -4.94" width="1.65" height="0.09" depth="0.62" color="#85563a"></a-box>

        <a-box position="6.95 1.45 -4.6" width="0.52" height="0.8" depth="0.22" color="#294d39"></a-box>
        <a-box position="7.65 1.45 -4.6" width="0.52" height="0.8" depth="0.22" color="#7a2f36"></a-box>
        <a-box position="6.95 2.5 -4.6" width="0.52" height="0.8" depth="0.22" color="#b4822d"></a-box>
        <a-box position="7.65 2.5 -4.6" width="0.52" height="0.8" depth="0.22" color="#364a59"></a-box>
        <a-box position="6.95 3.55 -4.6" width="0.52" height="0.8" depth="0.22" color="#6d4b3b"></a-box>
        <a-box position="7.65 3.55 -4.6" width="0.52" height="0.8" depth="0.22" color="#54663a"></a-box>

        {/* MESAS Y SILLAS */}
        {/* Mesa 1 */}
        <a-cylinder className="collider" position="-5.1 0.63 3.0" radius="1.0" height="0.10" color="#8b5a35"></a-cylinder>
        <a-cylinder className="collider" position="-5.1 0.31 3.0" radius="0.12" height="0.62" color="#2d2b28"></a-cylinder>
        <a-box className="collider" position="-6.45 0.46 3.0" width="0.7" height="0.92" depth="0.7" color="#315441"></a-box>
        <a-box className="collider" position="-3.75 0.46 3.0" width="0.7" height="0.92" depth="0.7" color="#315441"></a-box>

        {/* Mesa 2 */}
        <a-box className="collider" position="-4.6 0.72 -0.5" width="2.15" height="0.12" depth="1.15" color="#8b5a35"></a-box>
        <a-box className="collider" position="-4.6 0.36 -0.5" width="0.18" height="0.72" depth="0.18" color="#2d2b28"></a-box>
        <a-box className="collider" position="-5.85 0.48 -0.5" width="0.65" height="0.95" depth="0.65" color="#315441"></a-box>
        <a-box className="collider" position="-3.35 0.48 -0.5" width="0.65" height="0.95" depth="0.65" color="#315441"></a-box>

        {/* Mesa 3 */}
        <a-cylinder className="collider" position="5.2 0.63 3.2" radius="0.92" height="0.10" color="#8b5a35"></a-cylinder>
        <a-cylinder className="collider" position="5.2 0.31 3.2" radius="0.12" height="0.62" color="#2d2b28"></a-cylinder>
        <a-box className="collider" position="4.1 0.46 3.2" width="0.65" height="0.92" depth="0.65" color="#315441"></a-box>
        <a-box className="collider" position="6.3 0.46 3.2" width="0.65" height="0.92" depth="0.65" color="#315441"></a-box>

        {/* Banca izquierda */}
        <a-box className="collider" position="-7.4 0.52 0.85" width="1.2" height="1.05" depth="3.5" color="#294937"></a-box>

        {/* PLANTAS */}
        <a-cylinder className="collider" position="-7.2 0.42 -5.5" radius="0.48" height="0.84" color="#8a583b"></a-cylinder>
        <a-sphere position="-7.2 1.25 -5.5" radius="0.75" color="#315b35"></a-sphere>

        <a-cylinder className="collider" position="7.2 0.42 5.7" radius="0.45" height="0.84" color="#8a583b"></a-cylinder>
        <a-sphere position="7.2 1.22 5.7" radius="0.72" color="#315b35"></a-sphere>

        <a-cylinder className="collider" position="-1.6 0.32 6.35" radius="0.34" height="0.64" color="#8a583b"></a-cylinder>
        <a-sphere position="-1.6 0.95 6.35" radius="0.58" color="#3a6339"></a-sphere>

        {/* ARCOS / DECORACIÓN */}
        <a-box className="collider" position="-7.7 2.65 -2.6" width="0.5" height="5.0" depth="0.7" color="#bd7652"></a-box>
        <a-box className="collider" position="-3.5 2.65 -2.6" width="0.5" height="5.0" depth="0.7" color="#bd7652"></a-box>
        <a-box position="-5.6 4.85 -2.6" width="4.0" height="0.45" depth="0.7" color="#bd7652"></a-box>

        <a-text value="Buen café\nMejores historias"
                position="-8.15 3.35 1.4" rotation="0 90 0"
                align="center" color="#294937" width="4.6"></a-text>

        {/* LÁMPARAS */}
        <a-cylinder position="-4.9 4.55 2.2" radius="0.28" height="0.45" color="#a56b3f"></a-cylinder>
        <a-sphere position="-4.9 4.3 2.2" radius="0.13" color="#ffd591"
                  material="emissive: #ffd591; emissiveIntensity: 1"></a-sphere>

        <a-cylinder position="0.0 4.55 -2.5" radius="0.28" height="0.45" color="#a56b3f"></a-cylinder>
        <a-sphere position="0.0 4.3 -2.5" radius="0.13" color="#ffd591"
                  material="emissive: #ffd591; emissiveIntensity: 1"></a-sphere>

        <a-cylinder position="3.2 4.55 -2.5" radius="0.28" height="0.45" color="#a56b3f"></a-cylinder>
        <a-sphere position="3.2 4.3 -2.5" radius="0.13" color="#ffd591"
                  material="emissive: #ffd591; emissiveIntensity: 1"></a-sphere>
      </a-scene>
    </div>
  )
}
