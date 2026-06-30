//importamos la URL de la API desde las variables de entorno o usamos un valor por defecto si no está definida

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// Funciones para comunicarse con la API


export async function getProductos() {
  try {
    const response = await fetch(`${API_URL}/products`)
    const data = await response.json()
    console.log('Productos fetched:', data)
    return data
  } catch (error) {
    console.error('Error fetching productos:', error)
    return []
  }
}

export async function getCategorias() {
  try {
    const response = await fetch(`${API_URL}/categories`)
    const data = await response.json()
    console.log('Categorías fetched:', data)
    return data
  } catch (error) {
    console.error('Error fetching categorías:', error)
    return []
  }
}

export async function postProducto(producto) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    })
    const newProducto = await response.json()
    alert('Producto agregado exitosamente.')
    return newProducto
  } catch (error) {
    console.error('Error adding producto:', error)
    return null
  }
}

export async function deleteProducto(id) {
  try {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
    alert('Producto eliminado exitosamente.')
    return true
  } catch (error) {
    console.error('Error deleting producto:', error)
    return false
  }
}

export async function updateProducto(id, productoEditado) {
  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoEditado)
    })
    alert('Producto editado exitosamente.')
    return true
  } catch (error) {
    console.error('Error updating producto:', error)
    return false
  }
}

export async function getProductoById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`)
    const producto = await response.json()
    return producto
  } catch (error) {
    console.error('Error fetching producto by ID:', error)
    return null
  }
}
