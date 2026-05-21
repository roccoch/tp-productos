import { getProductoById, updateProducto, deleteProducto, postProducto } from '../api/productosApi.js'
import { validarFormulario } from '../utils/validaciones.js'

let productos = []

// Nuevas referencias al DOM basadas en el HTML de tus compañeros
const tablaProductos = document.getElementById('tbody-productos')
const btnProduct = document.getElementById('btn-agregar')
const editingIdInput = document.getElementById('editing-id')
const categorySelect = document.getElementById('select-categoria')

const inputNombre = document.getElementById('input-nombre')
const inputPrecio = document.getElementById('input-precio')
const inputStock = document.getElementById('input-stock')

// Elementos para las métricas que agregaron tus compañeros
const contadorProductos = document.getElementById('contador-productos')
const valorTotal = document.getElementById('valor-total')

export function setProductos(data) {
  productos = data
}

// Renderizar la tabla y de paso calcular las métricas que pide el footer nuevo
export function renderProductos() {
  tablaProductos.innerHTML = ''
  let totalDinero = 0

  productos.forEach(producto => {
    totalDinero += producto.price * producto.quantity

    const productoCard = document.createElement('tr')
    productoCard.className = 'producto-card'
    productoCard.innerHTML = `
      <td>${producto.name}</td>  
      <td>$${producto.price}</td>
      <td>${producto.quantity} u.</td>
      <td>
        <button class="edit-btn" data-id="${producto.id}" data-action="edit">Editar</button>
        <button class="delete-btn" data-id="${producto.id}" data-action="delete">Eliminar</button>
      </td>
    `
    tablaProductos.appendChild(productoCard)
  })

  // Actualizar los textos del footer dinámicamente
  if (contadorProductos) contadorProductos.textContent = `${productos.length} productos`;
  if (valorTotal) valorTotal.textContent = `Total: $${totalDinero.toLocaleString()}`;
}

export function llenarCategorias(categorias) {
  if (!categorySelect) return
  categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>'
  categorias.forEach(category => {
    const option = document.createElement('option')
    option.value = category.id
    option.textContent = category.name
    categorySelect.appendChild(option)
  })
}

// Manejador del click modificado (ya no es un submit de formulario)
export async function handleFormSubmit(event) {
  // Capturamos los valores de los nuevos IDs
  const name = inputNombre.value
  const price = parseFloat(inputPrecio.value)
  const quantity = parseInt(inputStock.value)
  const category = parseInt(categorySelect.value)
  const editingId = editingIdInput ? editingIdInput.value : ''

  if (!validarFormulario(name, price, quantity) || !category) {
    alert('Por favor, complete todos los campos correctamente, incluyendo la categoría.')
    return
  }

  const datosProducto = { 
    name: name, 
    price: price, 
    quantity: quantity,
    categoryId: category
  }

  if (editingId) {
    const exito = await updateProducto(parseInt(editingId), datosProducto)
    if (exito) {
      // Actualizar el array localmente para no tener que recargar la página
      productos = productos.map(p => p.id === parseInt(editingId) ? { ...p, ...datosProducto } : p)
      resetFormulario()
    }
  } else {
    const productoAgregado = await postProducto(datosProducto)
    if (productoAgregado) {
      // Agregamos el producto retornado (que ya trae la estructura de la DB)
      productos.push(productoAgregado)
      resetFormulario()
    }
  }
  
  renderProductos()
}

function resetFormulario() {
  inputNombre.value = ''
  inputPrecio.value = ''
  inputStock.value = ''
  categorySelect.value = ''
  if (editingIdInput) editingIdInput.value = ''
  if (btnProduct) btnProduct.textContent = 'Agregar'
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
    inputNombre.value = producto.name
    inputPrecio.value = producto.price
    inputStock.value = producto.quantity
    categorySelect.value = producto.categoryId
    if (editingIdInput) editingIdInput.value = id
    if (btnProduct) btnProduct.textContent = 'Guardar cambios'
  }
  return producto
}

export function inicializarListeners() {
  if (btnProduct) btnProduct.addEventListener('click', handleFormSubmit)
  if (tablaProductos) tablaProductos.addEventListener('click', handleTablaClick)
}