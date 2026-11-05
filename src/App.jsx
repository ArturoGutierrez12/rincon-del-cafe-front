import { Routes, Route } from 'react-router'
import Inicio from './Inicio.jsx'
import Login from './components/Login.jsx'
import Regin from './components/Regin.jsx'
import Checkout from './Checkout.jsx'
import Ticket from './Ticket.jsx'
import Admin from './ADMIN/Admin.jsx'


export default function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Regin />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/ticket" element={<Ticket />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}