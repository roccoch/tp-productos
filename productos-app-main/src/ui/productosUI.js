// Funciones para manipular el DOM y la interfaz de usuario

import { getProductoById, updateProducto, deleteProducto, postProducto } from '../api/productosApi.js'
import { validarFormulario } from '../utils/validaciones.js'

let productos = []

// Referencias a elementos del DOM
const tablaProductos = document.getElementById('productos')
const btnProduct = document.getElementById('btn-product')
const editingIdInput = document.getElementById('editing-id')
const productForm = document.getElementById('product-form')

export function setProductos(data) {
  productos = data
}

export function renderProductos() {
  tablaProductos.innerHTML = ''

  productos.forEach(producto => {
    const productoCard = document.createElement('tr')
    productoCard.className = 'producto-card'
    productoCard.innerHTML = `
      <td>${producto.name}</td>  
      <td>${producto.price}</td>
      <td>${producto.quantity}</td>
      <td>
        <button class="edit-btn" data-id="${producto.id}" data-action="edit">Editar</button>
        <button class="delete-btn" data-id="${producto.id}" data-action="delete">Eliminar</button>
      </td>
    `
    tablaProductos.appendChild(productoCard)
  })
}

export function llenarCategorias(categorias) {
  const categorySelect = document.getElementById('product-category')
  categorias.forEach(category => {
    const option = document.createElement('option')
    option.value = category.id
    option.textContent = category.name
    categorySelect.appendChild(option)
  })
}

export async function handleFormSubmit(event) {
  event.preventDefault()
  
  const name = document.getElementById('product-name').value
  const price = parseFloat(document.getElementById('product-price').value)
  const quantity = parseInt(document.getElementById('product-stock').value)
  const category = parseInt(document.getElementById('product-category').value)
  const editingId = editingIdInput ? editingIdInput.value : ''

  if (!validarFormulario(name, price, quantity)) {
    alert('Por favor, complete todos los campos correctamente.')
    return
  }

  const newProducto = { 
    name: name, 
    price: price, 
    quantity: quantity,
    categoryId: category
  }

  if (editingId) {
    await updateProducto(parseInt(editingId), newProducto)
    resetFormulario()
  } else {
    const productoAgregado = await postProducto(newProducto)
    if (productoAgregado) {
      productos.push(productoAgregado)
    }
    resetFormulario()
  }
  
  renderProductos()
}

function resetFormulario() {
  productForm.reset()
  if (editingIdInput) editingIdInput.value = ''
  if (btnProduct) btnProduct.textContent = 'Agregar Producto'
}

export async function handleTablaClick(event) {
  const button = event.target.closest('button')
  if (!button) return

  const id = parseInt(button.getAttribute('data-id'))
  const action = button.getAttribute('data-action')

  if (action === 'delete') {
    const resultado = await deleteProducto(id)
    if (resultado) {
      productos = productos.filter(p => p.id !== id)
      renderProductos()
    }
  } else if (action === 'edit') {
    await prepararEditarProducto(id)
  }
}

export async function prepararEditarProducto(id) {
  const producto = await getProductoById(id)
  if (producto) {
    document.getElementById('product-name').value = producto.name
    document.getElementById('product-price').value = producto.price
    document.getElementById('product-stock').value = producto.quantity
    document.getElementById('product-category').value = producto.categoryId
    if (editingIdInput) editingIdInput.value = id
    if (btnProduct) btnProduct.textContent = 'Guardar cambios'
  }
  return producto
}

// Inicializar listeners
export function inicializarListeners() {
  productForm.addEventListener('submit', handleFormSubmit)
  tablaProductos.addEventListener('click', handleTablaClick)
}
