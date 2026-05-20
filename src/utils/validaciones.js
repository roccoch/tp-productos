// Funciones auxiliares y utilidades

export function validarFormulario(name, price, quantity) {
  return name && !isNaN(price) && !isNaN(quantity) && name.trim() !== '' && price > 0 && quantity >= 0
}
