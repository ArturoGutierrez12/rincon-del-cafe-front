// src/pages/admin/AdminProductos.jsx
// CRUD de productos. "Eliminar" solo desactiva (activo = 0) y se puede reactivar.
import { useCallback, useEffect, useState } from 'react'
import {
  obtenerProductos,
  crearProducto,
  modificarProducto,
  desactivarProducto,
  reactivarProducto,
} from '../components/adminApi.js'
import { CATEGORIAS, comoLista, dinero, estaActivo } from '../components/utilidades.js'

const VACIO = {
  id_producto: '',
  nombre: '',
  descripcion: '',
  id_categoria: '1',
  id_origen: '',
  id_tueste: '',
  precio: '',
  stock: '',
}

const numeroONulo = (v) => (v === '' ? null : Number(v))

export default function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const [filtroEstado, setFiltroEstado] = useState('todos') // todos | activos | inactivos
  const [busqueda, setBusqueda] = useState('')

  const [formulario, setFormulario] = useState(null) // null = cerrado | { modo, datos }
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setError('')
      const data = await obtenerProductos()
      console.log('ADMIN PRODUCTOS:', data)
      setProductos(comoLista(data, 'productos'))
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  // ---------- Filtros ----------
  const visibles = productos.filter((p) => {
    if (filtroEstado === '1' && !estaActivo(p)) return false
    if (filtroEstado === '0' && estaActivo(p)) return false
    if (busqueda.trim() && !String(p.nombre).toLowerCase().includes(busqueda.trim().toLowerCase())) {
      return false
    }
    return true
  })

  // ---------- Formulario ----------
  const abrirCrear = () => {
    setErrorForm('')
    setFormulario({ modo: 'crear', datos: { ...VACIO } })
  }

  const abrirEditar = (p) => {
    setErrorForm('')
    setFormulario({
      modo: 'editar',
      datos: {
        id_producto: p.id_producto,
        nombre: p.nombre ?? '',
        descripcion: p.descripcion ?? '',
        id_categoria: String(p.id_categoria ?? '1'),
        id_origen: String(p.id_origen ?? ''),
        id_tueste: String(p.id_tueste ?? ''),
        precio: String(p.precio ?? ''),
        stock: String(p.stock ?? ''),
      },
    })
  }

  const cambiarCampo = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, datos: { ...prev.datos, [name]: value } }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    const d = formulario.datos

    if (!d.nombre.trim()) return setErrorForm('El nombre es obligatorio')
    if (d.precio === '' || Number(d.precio) < 0) return setErrorForm('Escribe un precio válido')
    if (d.stock === '' || !Number.isInteger(Number(d.stock)) || Number(d.stock) < 0) {
      return setErrorForm('El stock debe ser un número entero (0 o más)')
    }

    const producto = {
      nombre: d.nombre.trim(),
      descripcion: d.descripcion.trim(),
      id_categoria: Number(d.id_categoria),
      id_origen: numeroONulo(d.id_origen),
      id_tueste: numeroONulo(d.id_tueste),
      precio: Number(d.precio),
      stock: Number(d.stock),
    }

    try {
      setGuardando(true)
      setErrorForm('')

      if (formulario.modo === 'crear') {
        await crearProducto(producto)
        setAviso('Producto creado')
      } else {
        await modificarProducto({ ...producto, id_producto: Number(d.id_producto) })
        setAviso('Producto actualizado')
      }

      setFormulario(null)
      await cargar()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  // ---------- Activar / desactivar ----------
  const alternarActivo = async (p) => {
    const activo = estaActivo(p)
    if (activo && !window.confirm(`¿Desactivar "${p.nombre}"? Dejará de mostrarse en la tienda.`)) return

    try {
      setError('')
      if (activo) await desactivarProducto(p.id_producto)
      else await reactivarProducto(p.id_producto)
      setAviso(activo ? 'Producto desactivado' : 'Producto reactivado')
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <div className="admin-barra">
        <input
          type="search"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="1">Activos</option>
          <option value='0' >Inactivos</option>
        </select>
        <button className="btn btn-gold" onClick={abrirCrear}>+ Nuevo producto</button>
      </div>

      {aviso && <p className="admin-aviso" onClick={() => setAviso('')}>{aviso} ✕</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {cargando && <p className="admin-vacio">Cargando productos…</p>}

      {!cargando && (
        <div className="admin-scroll">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const activo = estaActivo(p)
                return (
                  <tr key={p.id_producto} className={activo ? '' : 'fila-inactiva'}>
                    <td>{p.id_producto}</td>
                    <td>
                      <img
                        className="admin-miniatura"
                        src={`/PRODUCTOS/${p.id_categoria}/${p.id_producto}.png`}
                        alt=""
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                      />
                    </td>
                    <td>{p.nombre}</td>
                    <td>{CATEGORIAS[p.id_categoria] ?? p.id_categoria}</td>
                    <td>{dinero(p.precio)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`insignia ${activo ? 'insignia-ok' : 'insignia-off'}`}>
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="admin-acciones">
                      <button onClick={() => abrirEditar(p)}>Editar</button>
                      <button onClick={() => alternarActivo(p)}>
                        {activo ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibles.length === 0 && <p className="admin-vacio">No hay productos con ese filtro.</p>}
        </div>
      )}

      {formulario && (
        <div
          className="admin-modal"
          onClick={(e) => e.target === e.currentTarget && setFormulario(null)}
        >
          <form className="admin-modal-panel" onSubmit={guardar} noValidate>
            <h2>{formulario.modo === 'crear' ? 'Nuevo producto' : `Editar producto #${formulario.datos.id_producto}`}</h2>

            <label>
              Nombre
              <input name="nombre" value={formulario.datos.nombre} onChange={cambiarCampo} />
            </label>

            <label>
              Descripción
              <textarea name="descripcion" rows="3" value={formulario.datos.descripcion} onChange={cambiarCampo} />
            </label>

            <label>
              Categoría
              <select name="id_categoria" value={formulario.datos.id_categoria} onChange={cambiarCampo}>
                {Object.entries(CATEGORIAS).map(([id, nombre]) => (
                  <option key={id} value={id}>{nombre}</option>
                ))}
              </select>
            </label>

            <div className="admin-fila">
              <label>
                ID origen
                <input name="id_origen" type="number" min="0" value={formulario.datos.id_origen} onChange={cambiarCampo} />
              </label>
              <label>
                ID tueste
                <input name="id_tueste" type="number" min="0" value={formulario.datos.id_tueste} onChange={cambiarCampo} />
              </label>
            </div>

            <div className="admin-fila">
              <label>
                Precio (MXN)
                <input name="precio" type="number" min="0" step="0.01" value={formulario.datos.precio} onChange={cambiarCampo} />
              </label>
              <label>
                Stock
                <input name="stock" type="number" min="0" step="1" value={formulario.datos.stock} onChange={cambiarCampo} />
              </label>
            </div>

            {errorForm && <p className="admin-error" role="alert">{errorForm}</p>}

            <div className="admin-modal-botones">
              <button type="button" className="btn btn-claro" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="btn btn-gold" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
