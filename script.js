
let imagenes = document.querySelectorAll(".carrusel-imagenes img");
let puntos = document.querySelectorAll(".punto");
let anterior = document.querySelector(".anterior");
let siguiente = document.querySelector(".siguiente");

let indice = 0;
let temporizador;

function mostrarImagen(numero) {
    imagenes[indice].classList.remove("activa");
    puntos[indice].classList.remove("activo");

    indice = (numero + imagenes.length) % imagenes.length;

    imagenes[indice].classList.add("activa");
    puntos[indice].classList.add("activo");
}

function reiniciarTemporizador() {
    clearInterval(temporizador);

    temporizador = setInterval(function() {
        mostrarImagen(indice + 1);
    }, 4000);
}

anterior.addEventListener("click", function() {
    mostrarImagen(indice - 1);
    reiniciarTemporizador();
});

siguiente.addEventListener("click", function() {
    mostrarImagen(indice + 1);
    reiniciarTemporizador();
});

puntos.forEach(function(punto, i) {
    punto.addEventListener("click", function() {
        mostrarImagen(i);
        reiniciarTemporizador();
    });
});

reiniciarTemporizador();

/* ===== CARRITO ===== */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const sidebar = document.getElementById("sidebar-carrito");
const overlay = document.getElementById("overlay");
const contenedorItems = document.getElementById("carrito-items");

function guardar() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function abrirCarrito() {
  sidebar.classList.add("abierto");
  overlay.classList.add("activo");
}

function cerrarCarrito() {
  sidebar.classList.remove("abierto");
  overlay.classList.remove("activo");
}

function formatear(n) {
  return "$" + n.toLocaleString("es-AR");
}

function renderCarrito() {
  const totalUnidades = carrito.reduce((s, p) => s + p.cantidad, 0);
  const totalPrecio = carrito.reduce((s, p) => s + p.cantidad * p.precio, 0);

  document.getElementById("contador-carrito").textContent = totalUnidades;
  document.getElementById("total-carrito").textContent = formatear(totalPrecio);

  if (carrito.length === 0) {
    contenedorItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
    return;
  }

  contenedorItems.innerHTML = carrito.map(p => `
    <div class="item-carrito">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="item-info">
        <h4>${p.nombre}</h4>
        <p>${formatear(p.precio * p.cantidad)}</p>
        <div class="controles-cantidad">
          <button data-accion="restar" data-nombre="${p.nombre}">−</button>
          <span>${p.cantidad}</span>
          <button data-accion="sumar" data-nombre="${p.nombre}">+</button>
        </div>
      </div>
    </div>
  `).join("");
}

function cambiarCantidad(nombre, delta) {
  const item = carrito.find(p => p.nombre === nombre);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => p.nombre !== nombre);
  }
  guardar();
  renderCarrito();
}

/* Agregar productos */
document.querySelectorAll(".btn-agregar").forEach(btn => {
  btn.addEventListener("click", () => {
    const nombre = btn.dataset.nombre;
    const precio = Number(btn.dataset.precio);
    const imagen = btn.closest(".tarjeta-producto").querySelector("img").getAttribute("src");

    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    guardar();
    renderCarrito();
  });
});

/* + y − dentro del carrito */
contenedorItems.addEventListener("click", e => {
  const btn = e.target.closest("button[data-accion]");
  if (!btn) return;
  cambiarCantidad(btn.dataset.nombre, btn.dataset.accion === "sumar" ? 1 : -1);
});

/* Cerrar */
overlay.addEventListener("click", cerrarCarrito);
document.getElementById("btn-cerrar").addEventListener("click", cerrarCarrito);

/* Pedir por WhatsApp */
document.getElementById("btn-comprar").addEventListener("click", () => {
  if (carrito.length === 0) return;

  const lineas = carrito.map(p => `• ${p.cantidad} x ${p.nombre} (${formatear(p.precio * p.cantidad)})`);
  const total = carrito.reduce((s, p) => s + p.cantidad * p.precio, 0);
  const mensaje = `Hola! Quiero hacer este pedido:\n${lineas.join("\n")}\n\nTotal: ${formatear(total)}`;

  window.open("https://wa.me/5492984796020?text=" + encodeURIComponent(mensaje), "_blank");
});

renderCarrito();