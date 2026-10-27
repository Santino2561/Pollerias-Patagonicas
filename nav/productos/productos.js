let productos = [];
let carrito = JSON.parse(localStorage.getItem('carritoPolleria')) || [];

// Paginación: 4 por fila x 3 filas = 12 por página
const POR_PAGINA = 12;
let paginaActual = 1;

// Emoji del placeholder según categoría (o subcategoría, si tiene una más específica)
const EMOJI_CATEGORIA = {
  "Pollo fresco": "🐔",
  "Milanesas": "🥩",
  "Especialidades": "🍔",
  "Rebozados": "🍗",
  "Congelados": "❄️",
  "Cajas por mayor": "📦",
  "Frutas": "🍓",
  "Vegetales": "🥬",
};
const EMOJI_SUBCATEGORIA = {
  "Pollo rebozado": "🍗",
  "Merluza rebozada": "🐟",
  "Papas": "🍟",
  "Picadas": "🥩",
  "Hamburguesas": "🍔",
  "Cerdo": "🐖",
};

function emojiDe(producto) {
  return (
    EMOJI_SUBCATEGORIA[producto.subcategoria] ||
    EMOJI_CATEGORIA[producto.categoria] ||
    "🍗"
  );
}

// Devuelve la foto del producto; si no tiene o no carga, un placeholder con emoji
function crearImagen(producto) {
  const crearPlaceholder = () => {
    const div = document.createElement("div");
    div.className = "img-placeholder";
    div.setAttribute("role", "img");
    div.setAttribute("aria-label", producto.nombre);
    div.textContent = emojiDe(producto);
    return div;
  };

  if (!producto.img) return crearPlaceholder();

  const img = document.createElement("img");
  img.src = producto.img;
  img.alt = producto.nombre;
  img.onerror = () => img.replaceWith(crearPlaceholder());
  return img;
}

// ========== FILTROS, BÚSQUEDA Y ORDEN ==========
let visibles = []; // productos que pasan los filtros (ya ordenados)

const filtros = {
  busqueda: "",
  categorias: new Set(),
  tipos: new Set(),
  marcas: new Set(),
  venta: "todos", // todos | kg | otros
  min: null,
  max: null,
  orden: "catalogo", // catalogo | precio-asc | precio-desc | nombre
};

// Minúsculas y sin tildes: "milanesa" encuentra "Milanesa" y "Albóndigas" = "albondigas"
const normalizar = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function pasaFiltros(p) {
  if (filtros.busqueda) {
    const texto = normalizar(
      [p.nombre, p.categoria, p.subcategoria, p.marca].filter(Boolean).join(" "),
    );
    if (!filtros.busqueda.split(/\s+/).every((palabra) => texto.includes(palabra))) return false;
  }
  if (filtros.categorias.size && !filtros.categorias.has(p.categoria)) return false;
  if (filtros.tipos.size && !filtros.tipos.has(p.subcategoria)) return false;
  if (filtros.marcas.size && !filtros.marcas.has(p.marca)) return false;
  if (filtros.venta === "kg" && p.unidad !== "kg") return false;
  if (filtros.venta === "otros" && p.unidad === "kg") return false;
  if (filtros.min !== null && p.precio < filtros.min) return false;
  if (filtros.max !== null && p.precio > filtros.max) return false;
  return true;
}
// FIN-NUCLEO

function aplicarFiltros() {
  visibles = productos.filter(pasaFiltros);

  if (filtros.orden === "precio-asc") visibles.sort((a, b) => a.precio - b.precio);
  else if (filtros.orden === "precio-desc") visibles.sort((a, b) => b.precio - a.precio);
  else if (filtros.orden === "nombre") visibles.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  paginaActual = 1;
  renderizarProductos();
}

// Crea los checkboxes de un grupo (con cantidad) a partir de los datos
function crearOpciones(idContenedor, campo, clave) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.textContent = "";

  const cuentas = new Map();
  productos.forEach((p) => {
    if (p[campo]) cuentas.set(p[campo], (cuentas.get(p[campo]) || 0) + 1);
  });

  // Si ningún producto tiene ese dato, el grupo no se muestra
  if (cuentas.size === 0) {
    const grupo = contenedor.closest("details");
    if (grupo) grupo.remove();
    return;
  }

  cuentas.forEach((cantidad, valor) => {
    const label = document.createElement("label");
    label.className = "opcion";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = valor;
    input.addEventListener("change", () => {
      if (input.checked) filtros[clave].add(valor);
      else filtros[clave].delete(valor);
      actualizarChips();
      aplicarFiltros();
    });

    const span = document.createElement("span");
    span.className = "cantidad";
    span.textContent = cantidad;

    label.append(input, " " + valor + " ", span);
    contenedor.appendChild(label);
  });
}

// Chips de categorías (arriba de los productos)
function crearChips() {
  const contenedor = document.getElementById("chips-categorias");
  if (!contenedor) return;
  contenedor.textContent = "";

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  ["Todos", ...categorias].forEach((nombre) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = nombre;
    chip.dataset.categoria = nombre === "Todos" ? "" : nombre;
    chip.addEventListener("click", () => {
      filtros.categorias.clear();
      if (nombre !== "Todos") filtros.categorias.add(nombre);
      sincronizarControles();
      aplicarFiltros();
    });
    contenedor.appendChild(chip);
  });
  actualizarChips();
}

function actualizarChips() {
  const cats = filtros.categorias;
  document.querySelectorAll("#chips-categorias .chip").forEach((chip) => {
    const c = chip.dataset.categoria;
    const activo = c === "" ? cats.size === 0 : cats.size === 1 && cats.has(c);
    chip.classList.toggle("activo", activo);
  });
}

// Deja los checkboxes, chips y radios iguales al estado actual
function sincronizarControles() {
  [
    ["filtro-categorias", "categorias"],
    ["filtro-tipos", "tipos"],
    ["filtro-marcas", "marcas"],
  ].forEach(([id, clave]) => {
    document.querySelectorAll(`#${id} input`).forEach((input) => {
      input.checked = filtros[clave].has(input.value);
    });
  });
  actualizarChips();

  const radio = document.querySelector(`input[name="venta"][value="${filtros.venta}"]`);
  if (radio) radio.checked = true;
}

function limpiarFiltros() {
  filtros.busqueda = "";
  filtros.categorias.clear();
  filtros.tipos.clear();
  filtros.marcas.clear();
  filtros.venta = "todos";
  filtros.min = null;
  filtros.max = null;
  filtros.orden = "catalogo";

  ["buscar-producto", "precio-min", "precio-max"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const selectOrden = document.getElementById("orden-productos");
  if (selectOrden) selectOrden.value = "catalogo";

  sincronizarControles();
  aplicarFiltros();
}

// Conecta los controles que ya están en el HTML (buscador, orden, precio, "venta")
function configurarFiltros() {
  const buscador = document.getElementById("buscar-producto");
  const buscar = () => {
    filtros.busqueda = normalizar(buscador ? buscador.value : "");
    aplicarFiltros();
  };
  if (buscador) buscador.addEventListener("input", buscar);
  const lupa = document.querySelector(".btn-lupa");
  if (lupa) {
    lupa.addEventListener("click", () => {
      buscar();
      if (buscador) buscador.focus();
    });
  }

  const selectOrden = document.getElementById("orden-productos");
  if (selectOrden) {
    selectOrden.addEventListener("change", () => {
      filtros.orden = selectOrden.value;
      aplicarFiltros();
    });
  }

  document.querySelectorAll('input[name="venta"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      filtros.venta = radio.value;
      aplicarFiltros();
    });
  });

  const inputMin = document.getElementById("precio-min");
  const inputMax = document.getElementById("precio-max");
  const leerPrecio = (input) => {
    if (!input || input.value === "") return null;
    const n = Number(input.value);
    return Number.isNaN(n) ? null : Math.max(0, n);
  };
  const aplicarPrecio = () => {
    filtros.min = leerPrecio(inputMin);
    filtros.max = leerPrecio(inputMax);
    aplicarFiltros();
  };
  const btnPrecio = document.getElementById("btn-aplicar-precio");
  if (btnPrecio) btnPrecio.addEventListener("click", aplicarPrecio);
  [inputMin, inputMax].forEach((input) => {
    if (!input) return;
    input.addEventListener("change", aplicarPrecio);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") aplicarPrecio();
    });
  });

  const btnLimpiar = document.getElementById("btn-limpiar-filtros");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltros);
}

async function cargarProductos() {
  try {
    const respuesta = await fetch('./productos.json');
    productos = await respuesta.json();
    crearOpciones("filtro-categorias", "categoria", "categorias");
    crearOpciones("filtro-tipos", "subcategoria", "tipos");
    crearOpciones("filtro-marcas", "marca", "marcas");
    crearChips();
    aplicarFiltros();
  } catch (error) {
    console.error('Error al cargar productos: ', error);
  }
}

function renderizarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;
  contenedor.textContent = "";

  if (visibles.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "sin-resultados";
    const msj = document.createElement("p");
    msj.textContent = "No encontramos productos con esos filtros.";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-aplicar";
    btn.textContent = "Limpiar filtros";
    btn.addEventListener("click", limpiarFiltros);
    vacio.append(msj, btn);
    contenedor.appendChild(vacio);
  }

  const inicio = (paginaActual - 1) * POR_PAGINA;
  const productosPagina = visibles.slice(inicio, inicio + POR_PAGINA);

  productosPagina.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-producto";

    const imagenProd = crearImagen(producto);

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

  const total = document.getElementById("total-resultados");
  if (total) total.textContent = visibles.length;

  renderizarPaginacion();
}

function renderizarPaginacion() {
  const nav = document.getElementById("paginacion");
  if (!nav) return;
  nav.textContent = "";

  const totalPaginas = Math.ceil(visibles.length / POR_PAGINA);
  if (totalPaginas <= 1) return;

  const crearBoton = (texto, pagina, deshabilitado = false, activo = false) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.disabled = deshabilitado;
    if (activo) boton.classList.add("activo");
    boton.addEventListener("click", () => {
      paginaActual = pagina;
      renderizarProductos();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    nav.appendChild(boton);
  };

  crearBoton("Anterior", paginaActual - 1, paginaActual === 1);
  for (let i = 1; i <= totalPaginas; i++) {
    crearBoton(String(i), i, false, i === paginaActual);
  }
  crearBoton("Siguiente", paginaActual + 1, paginaActual === totalPaginas);
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

  if (mensajeError) mensajeError.style.display = "none";
  if (contenedorBody) contenedorBody.textContent = "";

  let totalItems = 0;
  let totalPrecio = 0;

  if (carrito.length === 0) {
    const msjVacio = document.createElement("div");
    msjVacio.className = "carrito-vacio";
    msjVacio.textContent = "El carrito está vacío";
    if (contenedorBody) contenedorBody.appendChild(msjVacio);
  } else {
    carrito.forEach((item) => {
      totalItems += item.cantidad;
      totalPrecio += item.precio * item.cantidad;

      const itemCarrito = document.createElement("div");
      itemCarrito.classList.add("item-carrito");

      const imagen = crearImagen(item);

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

      if (contenedorBody) contenedorBody.appendChild(itemCarrito);
    });
  }

  // MÉTODOS DE PAGO
  const selectorPago = document.getElementById('selector-pago');
  const filaDescuento = document.getElementById('fila-descuento');
  const spanDescuento = document.getElementById('precio-descuento');

  let descuento = 0;

  if (selectorPago && selectorPago.value === 'efectivo' && totalPrecio > 0) {
    descuento = Math.round(totalPrecio * 0.05);
    if (filaDescuento) filaDescuento.style.display = 'flex';
    if (spanDescuento) spanDescuento.textContent = `$${descuento}`;
  } else {
    if (filaDescuento) filaDescuento.style.display = 'none';
  }

  let totalFinal = totalPrecio - descuento;

  if (contadorSpan) contadorSpan.textContent = totalItems;
  if (precioTotalSpan) precioTotalSpan.textContent = `$${totalFinal}`;

  localStorage.setItem('carritoPolleria', JSON.stringify(carrito));
}

// Sidebar Carrito
const sidebar = document.getElementById("sidebar-carrito");
const overlay = document.getElementById("overlay");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const btnCarrito = document.getElementById("btn-carrito");

if (btnCerrarCarrito) btnCerrarCarrito.addEventListener("click", cerrarCarrito);
if (btnCarrito) btnCarrito.addEventListener("click", abrirCarrito);
if (overlay) overlay.addEventListener("click", cerrarCarrito);

function abrirCarrito() {
  if (sidebar) sidebar.classList.add("abierto");
  if (overlay) overlay.classList.add("activo");
}
function cerrarCarrito() {
  if (sidebar) sidebar.classList.remove("abierto");
  if (overlay) overlay.classList.remove("activo");
}

// Finalizar Compra por WhatsApp
const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
if (btnFinalizarCompra) {
  btnFinalizarCompra.addEventListener("click", () => {
    finalizarCompra();
  });
}

function finalizarCompra() {
  if (carrito.length === 0) {
    const msjError = document.getElementById("mensaje-error");
    if (msjError) msjError.style.display = "block";
    return;
  }

  const selectorPago = document.getElementById('selector-pago');
  const esEfectivo = selectorPago && selectorPago.value === 'efectivo';

  let mensaje = "Hola buenas tardes! Quiero realizar el siguiente pedido:%0A%0A";
  let totalPrecio = 0;

  carrito.forEach((item) => {
    mensaje += ` ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})%0A`;
    totalPrecio += item.precio * item.cantidad;
  });

  if (esEfectivo) {
    let descuento = Math.round(totalPrecio * 0.05);
    let totalFinal = totalPrecio - descuento;
    mensaje += `%0A*Medio de pago:* Efectivo (5% OFF)%0A`;
    mensaje += `*Subtotal:* $${totalPrecio}%0A`;
    mensaje += `*Descuento:* $${descuento}%0A`;
    mensaje += `*Total a pagar: $${totalFinal}*%0A%0A`;
  } else {
    mensaje += `%0A*Medio de pago:* Transferencia / Tarjeta%0A`;
    mensaje += `*Total a pagar: $${totalPrecio}*%0A%0A`;
  }
  mensaje += "Por favor, confírmenme el pedido. ¡Gracias!";

  const urlWhatsapp = `https://wa.me/5492984796020?text=${mensaje}`;
  window.open(urlWhatsapp, "_blank");
}

// Escuchador para cambios en el selector de pago
const selectorPagoGlobal = document.getElementById("selector-pago");
if (selectorPagoGlobal) {
  selectorPagoGlobal.addEventListener("change", actualizarCarrito);
}

// Iniciar Página
document.addEventListener("DOMContentLoaded", () => {
  configurarFiltros();
  cargarProductos();
  actualizarCarrito();
});