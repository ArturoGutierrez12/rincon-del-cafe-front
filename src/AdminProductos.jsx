import { useEffect } from 'react'
import { obtenerProductos } from '../../services/adminApi'

export default function AdminProductos() {

  useEffect(() => {
    async function probarAPI() {
      try {
        const data = await obtenerProductos()

        console.log('RESPUESTA API:', data)
      } catch (error) {
        console.error('ERROR API:', error.message)
      }
    }

    probarAPI()
  }, [])

  return (
    <div>
      <h1>Prueba Admin Productos</h1>
      <p>Revisa la consola del navegador.</p>
    </div>
  )
}