// src/context/CarritoContext.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useAuth } from './AuthContext.jsx'

import {
  obtenerCarrito,
  agregarProductoCarrito,
  actualizarProductoCarrito,
  eliminarProductoCarrito,
  vaciarCarritoDB,
} from '../components/carritoApi.js'


const CarritoContext = createContext(null)


export function CarritoProvider({ children }) {

  const { usuario } = useAuth()

  const [carrito, setCarrito] = useState([])
  // CarritoContext.jsx
const [cargandoCarrito, setCargandoCarrito] = useState(Boolean(usuario?.id_usuario))


  // =========================================
  // CARGAR CARRITO DESDE MYSQL
  // =========================================

  const cargarCarrito = useCallback(async () => {

    if (!usuario?.id_usuario) {
      setCarrito([])
      return
    }

    try {

      setCargandoCarrito(true)

      const data = await obtenerCarrito(
        usuario.id_usuario
      )

      setCarrito(data.carrito || [])

    } catch (error) {

      console.error(
        'Error cargando carrito:',
        error.message
      )

    } finally {

      setCargandoCarrito(false)

    }

  }, [usuario?.id_usuario])


  // Cuando cambia/inicia sesión el usuario,
  // vuelve a cargar su carrito desde MySQL.

 useEffect(() => {
  async function sincronizar() {
    if (usuario?.id_usuario && carrito.length > 0) {
      try {
        for (const item of carrito) {
          await agregarProductoCarrito({
            idUsuario: usuario.id_usuario,
            idProducto: item.producto.id_producto,
            cantidad: item.cantidad,
          })
        }
      } catch (error) {
        console.error('Error guardando carrito:', error.message)
      }
    }
    await cargarCarrito()
  }

  sincronizar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [usuario?.id_usuario])


  // =========================================
  // AGREGAR PRODUCTO
  // =========================================

  const agregarAlCarrito = async (producto) => {
  if (!usuario?.id_usuario) {
    // Invitado: solo memoria
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id_producto === producto.id_producto)
      if (existe) {
        return prev.map((i) =>
          i.producto.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
    return
  }
  await agregarProductoCarrito({
    idUsuario: usuario.id_usuario,
    idProducto: producto.id_producto,
    cantidad: 1,
  })
  await cargarCarrito()
}


  // =========================================
  // CAMBIAR CANTIDAD
  // =========================================

  const cambiarCantidad = async (idProducto, nuevaCantidad) => {
  if (nuevaCantidad < 1) return

  if (!usuario?.id_usuario) {
    setCarrito((prev) =>
      prev.map((i) =>
        i.producto.id_producto === idProducto ? { ...i, cantidad: nuevaCantidad } : i
      )
    )
    return
  }

  await actualizarProductoCarrito({ idUsuario: usuario.id_usuario, idProducto, cantidad: nuevaCantidad })
  await cargarCarrito()
}



  // =========================================
  // QUITAR PRODUCTO
  // =========================================

  const quitarDelCarrito = async (idProducto) => {
  if (!usuario?.id_usuario) {
    setCarrito((prev) => prev.filter((i) => i.producto.id_producto !== idProducto))
    return
  }

  await eliminarProductoCarrito({ idUsuario: usuario.id_usuario, idProducto })
  await cargarCarrito()
}


  // =========================================
  // VACIAR CARRITO
  // =========================================

  const vaciarCarrito = useCallback(async () => {

    if (!usuario?.id_usuario) {

      setCarrito([])
      return

    }

    try {

      await vaciarCarritoDB(
        usuario.id_usuario
      )

      setCarrito([])

    } catch (error) {

      console.error(
        'Error vaciando carrito:',
        error.message
      )

      throw error
    }

  }, [usuario?.id_usuario])


  // =========================================
  // TOTALES
  // =========================================

  const totalItems = carrito.reduce(
    (total, item) =>
      total + Number(item.cantidad),
    0
  )


  const total = carrito.reduce(
    (total, item) =>
      total +
      Number(item.producto.precio) *
      Number(item.cantidad),
    0
  )


  return (
    <CarritoContext.Provider
      value={{
        carrito,

        agregarAlCarrito,
        cambiarCantidad,
        quitarDelCarrito,
        vaciarCarrito,

        cargarCarrito,

        totalItems,
        total,

        cargandoCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}


export function useCarrito() {

  const ctx = useContext(CarritoContext)

  if (!ctx) {
    throw new Error(
      'useCarrito debe usarse dentro de <CarritoProvider>'
    )
  }

  return ctx
}