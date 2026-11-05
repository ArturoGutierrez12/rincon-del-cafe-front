// src/components/CampoFormulario.jsx
// Un campo reutilizable: etiqueta + input + mensaje de error.
// Sirve para el login y también para un registro o cualquier otro formulario.
import { useId } from 'react'

export function CampoFormulario({
  etiqueta,
  nombre,
  tipo = 'text',
  valor,
  onChange,
  error,
  ...resto // autoComplete, placeholder, disabled, etc.
}) {
  // useId genera un id único para enlazar <label> con <input>
  const id = useId()

  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        value={valor}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...resto}
      />
      {error && (
        <span id={`${id}-error`} className="campo-error">
          {error}
        </span>
      )}
    </div>
  )
}
