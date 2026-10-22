let productos = []
let carrito = JSON.parse(localStorage.getItem('carritoPolleria')) || [];

async function cargarProductos() {
  try {
    const respuesta = await fetch('./productos.json')
    productos = await respuesta.json()
    renderizarProductos()
  } catch (error) {
      console.error('Error al cargar productos: ', error)
  }
}

function renderizarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return 
  contenedor.textContent = "";

  productos.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-producto";

    const imagenProd = document.createElement("img");
    imagenProd.src = producto.img;
    imagenProd.alt = producto.nombre;
    imagenProd.onerror = () => {
      imagenProd.src =
        "https://placehold.co/400x300/2B1A0E/FFD23F?text=" +
        encodeURIComponent(producto.nombre);
    };

    const infoProd = document.createElement("div");
    infoProd.className = "producto-info";

    const tituloProd = document.createElement("h3");
    tituloProd.textContent = producto.nombre;

    const precioProd = document.createElement("div");
    precioProd.className = "producto-precio";
    precioProd.textContent = `$${producto.precio} / ${producto.unidad}`;

    const botonAgregar = document.createElement("button");
    botonAgregar.className = "btn";
    botonAgregar.textContent = "Agregar al Carrito";
    botonAgregar.addEventListener("click", () => {
      agregarAlCarrito(producto.id);
    });

    infoProd.appendChild(tituloProd);
    infoProd.appendChild(precioProd);
    infoProd.appendChild(botonAgregar);

    tarjeta.appendChild(imagenProd);
    tarjeta.appendChild(infoProd);

    contenedor.appendChild(tarjeta);
  });
}

// Funciones del Carrito
function agregarAlCarrito(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  const itemCarrito = carrito.find((item) => item.id === idProducto);

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

  mensajeError.style.display = "none";
  contenedorBody.textContent = "";

  let totalItems = 0;
  let totalPrecio = 0;

  if (carrito.length === 0) {
    const msjVacio = document.createElement("div");
    msjVacio.className = "carrito-vacio";
    msjVacio.textContent = "El carrito está vacío";
    contenedorBody.appendChild(msjVacio);
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
      subtotalCarrito.setAttribute(
        "style",
        "font-weight: bold; color: var(--marron);",
      );
      subtotalCarrito.textContent = `$${item.precio * item.cantidad}`;

      itemCarrito.appendChild(infoCarrito);
      itemCarrito.appendChild(imagen);
      itemCarrito.appendChild(subtotalCarrito);

      contenedorBody.appendChild(itemCarrito);
    });
  }

  // METODOS DE PAGO
  const selectorPago = document.getElementById('selector-pago')
  const filaDescuento = document.getElementById('fila-descuento')
  const spanDescuento = document.getElementById('precio-descuento')

  let descuento = 0

  if (selectorPago && selectorPago.value === 'efectivo' && totalPrecio > 0) {
    descuento = Math.round(totalPrecio * 0.05)
    if (filaDescuento) filaDescuento.style.display = 'flex'
    if (spanDescuento) spanDescuento.textContent = `$${descuento}`
  } else {
    if (filaDescuento) filaDescuento.style.display = 'none'
  }

  let totalFinal = totalPrecio - descuento

  contadorSpan.textContent = totalItems
  precioTotalSpan.textContent = `$${totalFinal}`

  localStorage.setItem('carritoPolleria', JSON.stringify(carrito))
}

// Sidebar Carrito
const sidebar = document.getElementById("sidebar-carrito");
const overlay = document.getElementById("overlay");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const btnCarrito = document.getElementById("btn-carrito");

btnCerrarCarrito.addEventListener("click", cerrarCarrito);
btnCarrito.addEventListener("click", abrirCarrito);
overlay.addEventListener("click", cerrarCarrito);

function abrirCarrito() {
  sidebar.classList.add("abierto");
  overlay.classList.add("activo");
}
function cerrarCarrito() {
  sidebar.classList.remove("abierto");
  overlay.classList.remove("activo");
}

// Finalizar Compra por WhatsApp
const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
btnFinalizarCompra.addEventListener("click", () => {
  finalizarCompra();
});

function finalizarCompra() {
  if (carrito.length === 0) {
    const msjError = document.getElementById("mensaje-error");
    msjError.style.display = "block";
    return;
  }

const selectorPago = document.getElementById('selector-pago')
const esEfectivo = selectorPago && selectorPago.value === 'efectivo'

  let mensaje =
    "Hola buenas tardes! Quiero realizar el siguiente pedido:%0A%0A";
  let totalPrecio = 0;

  carrito.forEach((item) => {
    mensaje += ` ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})%0A`;
    total += item.precio * item.cantidad;
  });

  if (esEfectivo) {
    let descuento = Math.round(totalPrecio * 0.05)
    let totalFinal = totalPrecio - descuento
    mensaje += `%0A*Medio de pago:* Efectivo / Transferencia (5% OFF)%0A`;
    mensaje += `*Subtotal:* $${totalPrecio}%0A`;
    mensaje += `*Descuento:* $${descuento}%0A`;
    mensaje += `*Total a pagar: $${totalFinal}*%0A%0A`;
  } else {
    mensaje += `%0A*Medio de pago:* Tarjeta / Otro%0A`;
    mensaje += `*Total a pagar: $${totalPrecio}*%0A%0A`;
  }
  mensaje += "Por favor, confírmenme el pedido. ¡Gracias!";

  const urlWhatsapp = `https://wa.me/5492984796020?text=${mensaje}`;
  window.open(urlWhatsapp, "_blank");
}

const selectorPago = document.getElementById("selector-pago");
if(selectorPago) {
  selectorPago.addEventListener("change", actualizarCarrito);
}

// Iniciar Página
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();
});
