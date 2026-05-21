// Importar los módulos por responsabilidad
import { getProductos, getCategorias } from './api/productosApi.js'
import { setProductos, renderProductos, llenarCategorias, inicializarListeners } from './ui/productosUI.js'

// Función principal para inicializar la aplicación
async function inicializarApp() {
  try {
    // Cargar categorías en el formulario
    const categorias = await getCategorias()
    llenarCategorias(categorias)

    // Cargar y mostrar productos
    const productos = await getProductos()
    setProductos(productos)
    renderProductos()

    // Configurar listeners de eventos
    inicializarListeners()
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error)
  }
}

// Ejecutar al cargar la página
inicializarApp()