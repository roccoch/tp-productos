// ══════════════════════════════════════
// 1. ESTADO DE LA APLICACIÓN
// Array de objetos. Cada producto tiene:
// { id, nombre, precio, stock }
// ══════════════════════════════════════
let productos = [];
let busquedaActual = '';
let ordenActual    = 'reciente';

// ══════════════════════════════════════
// 2. REFERENCIAS AL DOM
// Guardamos los elementos HTML en variables
// para no buscarlos en el DOM cada vez.
// ══════════════════════════════════════
const inputNombre   = document.getElementById('input-nombre');
const inputPrecio   = document.getElementById('input-precio');
const inputStock    = document.getElementById('input-stock');
const btnAgregar    = document.getElementById('btn-agregar');
const tbodyProductos = document.getElementById('tbody-productos');
const inputBusqueda = document.getElementById('input-busqueda');
const selectOrden   = document.getElementById('select-orden');
const contadorEl    = document.getElementById('contador-productos');
const valorTotalEl  = document.getElementById('valor-total');
const btnLimpiar    = document.getElementById('btn-limpiar');

// ══════════════════════════════════════
// 3. FUNCIONES PRINCIPALES
// ══════════════════════════════════════

/**
 * agregarProducto()
 * Lee los 3 inputs, valida, crea un objeto producto
 * y lo agrega al array global.
 */
function agregarProducto() {
  const nombre = inputNombre.value.trim();
  const precio = parseFloat(inputPrecio.value); // parseFloat convierte string → número decimal
  const stock  = parseInt(inputStock.value);    // parseInt convierte string → número entero

  // Validación: todos los campos son obligatorios
  if (!nombre || isNaN(precio) || isNaN(stock) || precio < 0 || stock < 0) {
    marcarError([inputNombre, inputPrecio, inputStock]);
    return; // Detiene la función si hay error
  }

  // Crear objeto producto
  const nuevoProducto = {
    id:     Date.now(),  // ID único basado en timestamp (milisegundos)
    nombre: nombre,
    precio: precio,
    stock:  stock
  };

  productos.push(nuevoProducto); // Agregar al array

  // Limpiar inputs
  inputNombre.value = '';
  inputPrecio.value = '';
  inputStock.value  = '';
  inputNombre.focus();

  renderizar();
}

/**
 * eliminarProducto(id)
 * Filtra el array devolviendo uno nuevo sin el producto eliminado.
 * @param {number} id
 */
function eliminarProducto(id) {
  // .filter() crea un nuevo array EXCLUYENDO el elemento con ese id
  productos = productos.filter(p => p.id !== id);
  renderizar();
}

/**
 * editarStock(id, delta)
 * Aumenta o disminuye el stock de un producto en 1.
 * @param {number} id
 * @param {number} delta  +1 o -1
 */
function editarStock(id, delta) {
  productos = productos.map(function(p) {
    if (p.id === id) {
      const nuevoStock = p.stock + delta;
      // Math.max(0, ...) evita que el stock sea negativo
      return { ...p, stock: Math.max(0, nuevoStock) };
    }
    return p;
  });
  renderizar();
}

/**
 * limpiarSinStock()
 * Elimina todos los productos con stock = 0.
 */
function limpiarSinStock() {
  productos = productos.filter(p => p.stock > 0);
  renderizar();
}

// ══════════════════════════════════════
// 4. FUNCIÓN DE RENDERIZADO
// Reconstruye la tabla completa desde el
// array "productos" cada vez que hay cambios.
// ══════════════════════════════════════

/**
 * renderizar()
 * 1. Filtra por búsqueda
 * 2. Ordena según el select
 * 3. Borra el tbody y lo reconstruye con filas <tr>
 * 4. Actualiza el footer con estadísticas
 */
function renderizar() {
  // PASO 1: Filtrar por texto de búsqueda
  // .toLowerCase() hace la búsqueda insensible a mayúsculas
  let lista = productos.filter(function(p) {
    return p.nombre.toLowerCase().includes(busquedaActual.toLowerCase());
  });

  // PASO 2: Ordenar según el select
  // .sort() ordena el array in-place usando una función comparadora
  if (ordenActual === 'nombre') {
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (ordenActual === 'precio-asc') {
    lista.sort((a, b) => a.precio - b.precio);
  } else if (ordenActual === 'precio-desc') {
    lista.sort((a, b) => b.precio - a.precio);
  } else if (ordenActual === 'stock') {
    lista.sort((a, b) => b.stock - a.stock);
  }
  // 'reciente' no necesita ordenar: el array ya tiene orden de inserción

  // PASO 3: Limpiar y reconstruir el tbody
  tbodyProductos.innerHTML = '';

  if (lista.length === 0) {
    // Mensaje cuando no hay resultados
    tbodyProductos.innerHTML = `
      <tr class="tabla__vacia">
        <td colspan="5">No se encontraron productos 📦</td>
      </tr>`;
  } else {
    lista.forEach(function(p) {
      const tr = document.createElement('tr'); // Crear fila

      // Determinar badge de estado según stock
      let badge;
      if (p.stock === 0) {
        badge = '<span class="badge badge--agotado">Sin stock</span>';
      } else if (p.stock <= 5) {
        badge = '<span class="badge badge--bajo">Stock bajo</span>';
      } else {
        badge = '<span class="badge badge--ok">Disponible</span>';
      }

      // Template literal: genera el HTML de la fila
      // data-id guarda el id del producto para usarlo en los event listeners
      tr.innerHTML = `
        <td>${escapeHTML(p.nombre)}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>
          <button class="btn-accion btn-stock-menos" data-id="${p.id}">−</button>
          <strong style="margin:0 8px">${p.stock}</strong>
          <button class="btn-accion btn-stock-mas" data-id="${p.id}">+</button>
        </td>
        <td>${badge}</td>
        <td>
          <button class="btn-accion btn-accion--eliminar btn-eliminar" data-id="${p.id}">Eliminar</button>
        </td>
      `;

      tbodyProductos.appendChild(tr); // Agregar fila al tbody
    });
  }

  // PASO 4: Actualizar estadísticas del footer
  const total = productos.reduce((suma, p) => suma + (p.precio * p.stock), 0);
  // .reduce() acumula valores: suma precio*stock de cada producto
  contadorEl.textContent   = `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
  valorTotalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// ══════════════════════════════════════
// 5. SEGURIDAD: ESCAPAR HTML
// Previene que el usuario inyecte código
// HTML malicioso (XSS) en el nombre.
// ══════════════════════════════════════
function escapeHTML(texto) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

// ══════════════════════════════════════
// 6. HELPER: MARCAR ERRORES
// Pone borde rojo temporalmente en inputs
// vacíos o con valores inválidos.
// ══════════════════════════════════════
function marcarError(inputs) {
  inputs.forEach(function(input) {
    if (!input.value.trim() || isNaN(parseFloat(input.value))) {
      input.style.borderColor = '#f76a6a';
      setTimeout(() => { input.style.borderColor = ''; }, 1200);
    }
  });
}

// ══════════════════════════════════════
// 7. EVENT LISTENERS
// Escuchan acciones del usuario y ejecutan
// las funciones correspondientes.
// ══════════════════════════════════════

// Botón Agregar
btnAgregar.addEventListener('click', agregarProducto);

// Enter en cualquier input del formulario
[inputNombre, inputPrecio, inputStock].forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') agregarProducto();
  });
});

// Búsqueda en tiempo real (evento 'input' se dispara con cada tecla)
inputBusqueda.addEventListener('input', function() {
  busquedaActual = inputBusqueda.value;
  renderizar();
});

// Cambio de orden
selectOrden.addEventListener('change', function() {
  ordenActual = selectOrden.value;
  renderizar();
});

// Delegación de eventos en la tabla:
// Un solo listener maneja clicks de TODAS las filas.
// Detectamos qué botón se clickeó por su clase.
tbodyProductos.addEventListener('click', function(e) {
  const el = e.target;
  const id = Number(el.dataset.id); // Leer data-id del botón

  if (el.classList.contains('btn-eliminar'))    eliminarProducto(id);
  if (el.classList.contains('btn-stock-mas'))   editarStock(id, +1);
  if (el.classList.contains('btn-stock-menos')) editarStock(id, -1);
});

// Botón limpiar sin stock
btnLimpiar.addEventListener('click', limpiarSinStock);

// ══════════════════════════════════════
// 8. DATOS DE EJEMPLO E INICIALIZACIÓN
// ══════════════════════════════════════
productos = [
  { id: 1, nombre: 'Notebook Lenovo IdeaPad', precio: 850.00, stock: 12 },
  { id: 2, nombre: 'Monitor 24" Full HD',     precio: 320.00, stock: 4  },
  { id: 3, nombre: 'Teclado Mecánico RGB',    precio: 95.50,  stock: 0  },
  { id: 4, nombre: 'Mouse Inalámbrico',       precio: 45.00,  stock: 23 },
];

renderizar(); // Primera llamada: construye la tabla inicial