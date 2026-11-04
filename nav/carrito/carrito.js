// ===== carrito.js =====

// 1. Inicializamos el carrito leyendo el LocalStorage
let carrito = JSON.parse(localStorage.getItem('carritoPolleria')) || [];

// 2. Modificamos esta función para que reciba el OBJETO producto entero
// Así el carrito no necesita buscar en el JSON, es independiente.
function agregarAlCarrito(producto) {
  const itemCarrito = carrito.find((item) => item.id === producto.id);
  if (itemCarrito) {
    itemCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
  abrirCarrito();
}

function modificarCantidad(idProducto, nuevaCantidad) {
  const item = carrito.find((i) => i.id === idProducto);
  if (item) {
    item.cantidad += nuevaCantidad;
    if (item.cantidad <= 0) {
      carrito = carrito.filter((i) => i.id !== idProducto);
    }
    actualizarCarrito();
  }
}

function actualizarCarrito() {
  const contenedorBody = document.getElementById("carrito-body");
  const contadorSpan = document.getElementById("contador-carrito");
  const precioTotalSpan = document.getElementById("precio-total");
  const mensajeError = document.getElementById("mensaje-error");

  if(mensajeError) mensajeError.style.display = "none";
  if(contenedorBody) contenedorBody.textContent = "";

  let totalItems = 0;
  let totalPrecio = 0;

  if (carrito.length === 0) {
    const msjVacio = document.createElement("div");
    msjVacio.className = "carrito-vacio";
    msjVacio.textContent = "El carrito está vacío";
    if(contenedorBody) contenedorBody.appendChild(msjVacio);
  } else {
    carrito.forEach((item) => {
      totalItems += item.cantidad;
      totalPrecio += item.precio * item.cantidad;

      const itemCarrito = document.createElement("div");
      itemCarrito.classList.add("item-carrito");

      const imagen = document.createElement("img");
      imagen.src = item.img;
      imagen.alt = item.nombre;

      const infoCarrito = document.createElement("div");
      infoCarrito.classList.add("item-info");

      const tituloCarrito = document.createElement("h4");
      tituloCarrito.textContent = item.nombre;

      const precioP = document.createElement("p");
      precioP.textContent = `$${item.precio}`;

      const controles = document.createElement("div");
      controles.classList.add("controles-cantidad");

      const btnMenos = document.createElement("button");
      btnMenos.textContent = "-";
      btnMenos.addEventListener("click", () => modificarCantidad(item.id, -1));

      const spanCantidad = document.createElement("span");
      spanCantidad.textContent = item.cantidad;

      const btnMas = document.createElement("button");
      btnMas.textContent = "+";
      btnMas.addEventListener("click", () => modificarCantidad(item.id, 1));

      controles.appendChild(btnMenos);
      controles.appendChild(spanCantidad);
      controles.appendChild(btnMas);

      infoCarrito.appendChild(tituloCarrito);
      infoCarrito.appendChild(precioP);
      infoCarrito.appendChild(controles);

      const subtotalCarrito = document.createElement("div");
      subtotalCarrito.setAttribute("style", "font-weight: bold; color: var(--marron);");
      subtotalCarrito.textContent = `$${item.precio * item.cantidad}`;

      itemCarrito.appendChild(infoCarrito);
      itemCarrito.appendChild(imagen);
      itemCarrito.appendChild(subtotalCarrito);

      if(contenedorBody) contenedorBody.appendChild(itemCarrito);
    });
  }

  // DESCUENTOS Y TOTALES
  const selectorPago = document.getElementById('selector-pago');
  const filaDescuento = document.getElementById('fila-descuento');
  const spanDescuento = document.getElementById('precio-descuento');
  let descuento = 0;

  if (selectorPago && selectorPago.value === 'efectivo' && totalPrecio > 0) {
    descuento = Math.round(totalPrecio * 0.05);
    if (filaDescuento) filaDescuento.style.display = 'flex';
    if (spanDescuento) spanDescuento.textContent = `-$${descuento}`;
  } else {
    if (filaDescuento) filaDescuento.style.display = 'none';
  }

  let totalFinal = totalPrecio - descuento;

  if(contadorSpan) contadorSpan.textContent = totalItems;
  if(precioTotalSpan) precioTotalSpan.textContent = `$${totalFinal}`;

  localStorage.setItem('carritoPolleria', JSON.stringify(carrito));
}

// 3. Controladores de la interfaz del carrito
function abrirCarrito() {
  const sidebar = document.getElementById("sidebar-carrito");
  const overlay = document.getElementById("overlay");
  if(sidebar) sidebar.classList.add("abierto");
  if(overlay) overlay.classList.add("activo");
}

function cerrarCarrito() {
  const sidebar = document.getElementById("sidebar-carrito");
  const overlay = document.getElementById("overlay");
  if(sidebar) sidebar.classList.remove("abierto");
  if(overlay) overlay.classList.remove("activo");
}

function finalizarCompra() {
  if (carrito.length === 0) {
    const msjError = document.getElementById("mensaje-error");
    if(msjError) msjError.style.display = "block";
    return;
  }

  const selectorPago = document.getElementById('selector-pago');
  const esEfectivo = selectorPago && selectorPago.value === 'efectivo';
  let mensaje = "Hola buenas tardes! Quiero realizar el siguiente pedido:%0A%0A";
  let totalPrecio = 0;

  carrito.forEach((item) => {
    mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})%0A`;
    totalPrecio += item.precio * item.cantidad;
  });

  if (esEfectivo) {
    let descuento = Math.round(totalPrecio * 0.05);
    let totalFinal = totalPrecio - descuento;
    mensaje += `%0A*Medio de pago:* Efectivo (5% OFF)%0A`;
    mensaje += `*Subtotal:* $${totalPrecio}%0A`;
    mensaje += `*Descuento:* -$${descuento}%0A`;
    mensaje += `*Total a pagar: $${totalFinal}*%0A%0A`;
  } else {
    mensaje += `%0A*Medio de pago:* Transferencia / Tarjeta%0A`;
    mensaje += `*Total a pagar: $${totalPrecio}*%0A%0A`;
  }
  mensaje += "Por favor, confírmenme el pedido. ¡Gracias!";
  window.open(`https://wa.me/5492984796020?text=${mensaje}`, "_blank");
}

// 4. Iniciar eventos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
  const btnCarrito = document.getElementById("btn-carrito");
  const overlay = document.getElementById("overlay");
  const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
  const selectorPago = document.getElementById("selector-pago");

  if(btnCerrarCarrito) btnCerrarCarrito.addEventListener("click", cerrarCarrito);
  if(btnCarrito) btnCarrito.addEventListener("click", abrirCarrito);
  if(overlay) overlay.addEventListener("click", cerrarCarrito);
  if(btnFinalizarCompra) btnFinalizarCompra.addEventListener("click", finalizarCompra);
  if(selectorPago) selectorPago.addEventListener("change", actualizarCarrito);

  // Pintamos el carrito con lo que haya en memoria
  actualizarCarrito();
});