import './productos.css'
import {iconocarrito} from './iconCarrito.jsx'
import {} from 'mysql.connector'
export function Productos ({productos}){
return(
<main className='products'>
    <ul>
        {productos.map(product =>(
            <li key={product.id}>
                <img src={product.image} alt={product.titulo} />
                <div>
                    <strong>
                        {product.title}
                    </strong>
                </div>
                <div>
                    <button>
                        <iconocarrito></iconocarrito>
                    </button>
                </div>
            </li>


        ))}
    </ul>


</main>

)

}