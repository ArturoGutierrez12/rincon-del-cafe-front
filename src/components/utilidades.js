// src/pages/admin/utilidades.js
// Ayudas pequeñas compartidas por las pantallas de admin.
import { API } from './config.js'
export const CATEGORIAS = {
  1: 'Cafés por origen',
  2: 'Cafés especiales',
  3: 'Métodos de preparación',
  4: 'Accesorios',
}

export const dinero = (n) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export function fechaLegible(valor) {
  if (!valor) return '—'
  // MySQL manda "2026-11-05 00:32:00": con "T" el navegador lo entiende siempre
  const f = new Date(String(valor).replace(' ', 'T'))
  return Number.isNaN(f.getTime()) ? String(valor) : f.toLocaleString('es-MX')
}

// El backend puede responder con un arreglo directo o con { ventas: [...] }, { productos: [...] }, etc.
export function comoLista(data, ...claves) {
  if (Array.isArray(data)) return data
  for (const clave of claves) {
    if (Array.isArray(data?.[clave])) return data[clave]
  }
  return []
}

// Devuelve el primer campo que exista. Sirve por si el backend nombra distinto una columna.
export function primero(obj, ...claves) {
  for (const clave of claves) {
    if (obj?.[clave] !== undefined && obj?.[clave] !== null) return obj[clave]
  }
  return undefined
}

// Si la API no manda "activo", se asume que el producto está activo
export const estaActivo = (p) => (p.activo === undefined ? true : Number(p.activo) === 1)
