// Todos los productos
const productos = [
  {
    id: 1,
    nombre: "Pollo Entero",
    precio: 2500,
    unidad: "kg",
    img: "https://www.carnave.com.ar/wp-content/uploads/2020/05/Pollo-entero.jpg",
  },
  {
    id: 2,
    nombre: "Pechuga Deshuesada",
    precio: 4500,
    unidad: "kg",
    img: "https://www.carnave.com.ar/wp-content/uploads/2020/10/2-pechugas.png",
  },
  {
    id: 3,
    nombre: "Milanesas de Pollo",
    precio: 3800,
    unidad: "kg",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdUQHB-ydH4rk4_zZB49yEdpA7sER5f_7DZo7KE32nFHHtWAeGeTxPwvk&s=10",
  },
  {
    id: 4,
    nombre: "Pata Muslo",
    precio: 2200,
    unidad: "kg",
    img: "https://arcordiezb2c.vtexassets.com/arquivos/ids/176245/Pata-Y-Muslo-X-Kg-1-5539.jpg?v=638042097762030000",
  },
  {
    id: 5,
    nombre: "Alitas",
    precio: 1500,
    unidad: "kg",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_UGsPBNzLTWO7JXVU3E8HJPykfwJjqEcxRbfaJeG721WZ471YjaCHAFMJ&s=10",
  },
  {
    id: 6,
    nombre: "Suprema Rellena",
    precio: 5000,
    unidad: "un",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBAIAQAvxWOBYA5JRYF7igDKUYqeQrkf_fqWnT7pjnbHgzrmpajQ84uek&s=10",
  },
  {
    id: 7,
    nombre: "Menudos de Pollo",
    precio: 800,
    unidad: "kg",
    img: "https://http2.mlstatic.com/D_NQ_NP_750868-MLA83540782459_042025-O.webp",
  },
  {
    id: 8,
    nombre: "Pata Sola",
    precio: 2400,
    unidad: "kg",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXowmi7bWTs9WxfYslNEKVsmFQNYWoKXMUeU60pLA4XdAhlcQqtlso6_PW&s=10",
  },
];

let carrito = [];

function renderizarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
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
  contadorSpan.textContent = totalItems;
  precioTotalSpan.textContent = `$${totalPrecio}`;
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
  let mensaje =
    "Hola buenas tardes! Quiero realizar el siguiente pedido:%0A%0A";
  let total = 0;

  carrito.forEach((item) => {
    mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})%0A`;
    total += item.precio * item.cantidad;
  });

  mensaje += `%0A*Total a pagar: $${total}*%0A%0A`;
  mensaje += "Por favor, confírmenme el pedido. ¡Gracias!";

  const urlWhatsapp = `https://wa.me/5492984796020?text=${mensaje}`;
  window.open(urlWhatsapp, "_blank");
}

// Iniciar Página
window.onload = () => {
  renderizarProductos();
  actualizarCarrito();
};
