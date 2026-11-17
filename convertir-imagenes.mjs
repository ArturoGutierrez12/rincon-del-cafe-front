import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const RAIZ = './public/PRODUCTOS'

async function convertir(carpeta) {
  for (const nombre of await readdir(carpeta)) {
    const ruta = path.join(carpeta, nombre)

    if ((await stat(ruta)).isDirectory()) {
      await convertir(ruta) // entra a /1, /2, /3, /4
    } else if (nombre.toLowerCase().endsWith('.png')) {
      const salida = ruta.replace(/\.png$/i, '.webp')
      await sharp(ruta)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(salida)
      console.log('OK', salida)
    }
  }
}

await convertir(RAIZ)