import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { router } from './app/router'
import './App.css'

export function App() {
  return <ThemeProvider><AuthProvider><CartProvider><RouterProvider router={router} /></CartProvider></AuthProvider></ThemeProvider>
}
export default App
