// ===== productos.js =====

let productos = [];
let visibles = [];
let tarjetas = []; // productos ya agrupados (1 tarjeta por grupo)
const POR_PAGINA = 12;
let paginaActual = 1;

// Objeto de emojis para placeholders
const EMOJI_CATEGORIA = {
  "Pollo fresco": "🐔",
  Milanesas: "🥩",
  Especialidades: "🍔",
  Rebozados: "🍗",
  Congelados: "❄️",
  "Cajas por mayor": "📦",
  Frutas: "🍓",
  Vegetales: "🥬",
};
const EMOJI_SUBCATEGORIA = {
  "Pollo rebozado": "🍗",
  "Merluza rebozada": "🐟",
  Papas: "🍟",
  Picadas: "🥩",
  Hamburguesas: "🍔",
  Cerdo: "🐖",
};

const filtros = {
  busqueda: "",
  categorias: new Set(),
  tipos: new Set(),
  marcas: new Set(),
  venta: "todos",
  min: null,
  max: null,
  orden: "catalogo",
};

document.addEventListener("DOMContentLoaded", () => {
  configurarFiltros();
  cargarCatalogoCompleto();
});

async function cargarCatalogoCompleto() {
  try {
    const respuesta = await fetch("/nav/productos/productos.json");
    productos = await respuesta.json();

    if (document.getElementById("filtro-categorias")) {
      crearOpciones("filtro-categorias", "categoria", "categorias");
      crearOpciones("filtro-tipos", "subcategoria", "tipos");
      crearOpciones("filtro-marcas", "marca", "marcas");
      crearChips();
      aplicarFiltros();

      // Leemos si viene una categoría por la URL desde el menú desplegable
      const parametros = new URLSearchParams(window.location.search);
      const categoriaURL = parametros.get("categoria");

      if (categoriaURL) {
        filtros.categorias.add(categoriaURL);
        sincronizarControles();
        aplicarFiltros();
      }
    }
  } catch (error) {
    console.error("Error cargando catálogo:", error);
  }
}

function crearImagen(producto) {
  if (!producto.img) {
    const div = document.createElement("div");
    div.className = "img-placeholder";
    div.textContent = EMOJI_SUBCATEGORIA[producto.subcategoria] || EMOJI_CATEGORIA[producto.categoria] || "🍗";
    return div;
  }
  const img = document.createElement("img");
  img.src = producto.img;
  img.alt = producto.nombre;
  return img;
}

// Agrupa las variantes (mismo "grupo") en una sola tarjeta, respetando el orden
function agruparProductos(lista) {
  const mapa = new Map();
  lista.forEach((p) => {
    const clave = p.grupo || p.nombre;
    if (!mapa.has(clave)) mapa.set(clave, { titulo: clave, variantes: [] });
    mapa.get(clave).variantes.push(p);
  });
  return [...mapa.values()];
}

// "Pata muslo x 3 kg" -> "3 kg" | "Pata muslo" (por kilo) -> "Por kilo"
function etiquetaVariante(producto, titulo) {
  let resto = producto.nombre.startsWith(titulo) ? producto.nombre.slice(titulo.length) : producto.nombre;
  resto = resto.trim().replace(/^x\s*/i, "");
  if (resto) return resto;
  return producto.unidad === "kg" ? "Por kilo" : "Unidad";
}

function cerrarSelectores(excepto = null) {
  document.querySelectorAll(".tarjeta-producto.abierta").forEach((t) => {
    if (t === excepto) return;
    t.classList.remove("abierta");
    const b = t.querySelector(".selector-peso");
    if (b) b.setAttribute("aria-expanded", "false");
  });
}

// Cerrar al tocar afuera o con Escape (se registra una sola vez)
document.addEventListener("click", (e) => {
  if (!e.target.closest(".selector-wrap")) cerrarSelectores();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarSelectores();
});

function crearTarjeta(grupo) {
  const { titulo, variantes } = grupo;
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta-producto";

  let actual = variantes[0];
  const tieneVariantes = variantes.length > 1;

  const infoProd = document.createElement("div");
  infoProd.className = "producto-info";

  const tituloProd = document.createElement("h3");
  tituloProd.textContent = tieneVariantes ? titulo : actual.nombre;
  infoProd.appendChild(tituloProd);

  const botonAgregar = document.createElement("button");
  botonAgregar.className = "btn-agregar";
  botonAgregar.textContent = "Agregar al Carrito";
  botonAgregar.addEventListener("click", () => window.agregarAlCarrito(actual));

  if (!tieneVariantes) {
    // Sin variaciones: queda igual que antes
    const precioProd = document.createElement("div");
    precioProd.className = "producto-precio";
    precioProd.textContent = `$${actual.precio} / ${actual.unidad}`;
    infoProd.appendChild(precioProd);
  } else {
    // Con variaciones: mini lista desplegable de peso + precio
    const wrap = document.createElement("div");
    wrap.className = "selector-wrap";

    const selector = document.createElement("button");
    selector.type = "button";
    selector.className = "selector-peso";
    selector.setAttribute("aria-haspopup", "listbox");
    selector.setAttribute("aria-expanded", "false");

    const textoSelector = document.createElement("span");
    const flecha = document.createElement("span");
    flecha.className = "flecha";
    selector.append(textoSelector, flecha);

    const lista = document.createElement("ul");
    lista.className = "lista-pesos";
    lista.setAttribute("role", "listbox");

    const botonesOpcion = [];

    const actualizarSeleccion = () => {
      textoSelector.textContent = `${etiquetaVariante(actual, titulo)} · $${actual.precio}`;
      botonesOpcion.forEach(({ boton, variante }) => {
        const activa = variante === actual;
        boton.classList.toggle("activa", activa);
        boton.setAttribute("aria-selected", String(activa));
      });
    };

    variantes.forEach((variante) => {
      const li = document.createElement("li");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "opcion-peso";
      boton.setAttribute("role", "option");

      const peso = document.createElement("span");
      peso.textContent = etiquetaVariante(variante, titulo);
      const precio = document.createElement("span");
      precio.textContent = `$${variante.precio}`;
      boton.append(peso, precio);

      boton.addEventListener("click", () => {
        actual = variante;
        actualizarSeleccion();
        tarjeta.classList.remove("abierta");
        selector.setAttribute("aria-expanded", "false");
      });

      li.appendChild(boton);
      lista.appendChild(li);
      botonesOpcion.push({ boton, variante });
    });

    selector.addEventListener("click", () => {
      const abrir = !tarjeta.classList.contains("abierta");
      cerrarSelectores(tarjeta);
      tarjeta.classList.toggle("abierta", abrir);
      selector.setAttribute("aria-expanded", String(abrir));
    });

    actualizarSeleccion();
    wrap.append(selector, lista);
    infoProd.appendChild(wrap);
  }

  infoProd.appendChild(botonAgregar);

  tarjeta.appendChild(crearImagen(variantes[0]));
  tarjeta.appendChild(infoProd);
  return tarjeta;
}

function renderizarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;
  contenedor.textContent = "";

  tarjetas = agruparProductos(visibles);

  if (tarjetas.length === 0) {
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
  tarjetas.slice(inicio, inicio + POR_PAGINA).forEach((grupo) => {
    contenedor.appendChild(crearTarjeta(grupo));
  });

  const total = document.getElementById("total-resultados");
  if (total) total.textContent = tarjetas.length;

  renderizarPaginacion();
}

function renderizarPaginacion() {
  const nav = document.getElementById("paginacion");
  if (!nav) return;
  nav.textContent = "";

  const totalPaginas = Math.ceil(tarjetas.length / POR_PAGINA);
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

// ========== FILTROS, BÚSQUEDA Y ORDEN ==========

const normalizar = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function pasaFiltros(p) {
  if (filtros.busqueda) {
    const texto = normalizar([p.nombre, p.categoria, p.subcategoria, p.marca].filter(Boolean).join(" "));
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

function aplicarFiltros() {
  visibles = productos.filter(pasaFiltros);

  if (filtros.orden === "precio-asc") visibles.sort((a, b) => a.precio - b.precio);
  else if (filtros.orden === "precio-desc") visibles.sort((a, b) => b.precio - a.precio);
  else if (filtros.orden === "nombre") visibles.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  paginaActual = 1;
  renderizarProductos();
}

function crearOpciones(idContenedor, campo, clave) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.textContent = "";

  const cuentas = new Map();
  productos.forEach((p) => {
    if (p[campo]) cuentas.set(p[campo], (cuentas.get(p[campo]) || 0) + 1);
  });

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

function sincronizarControles() {
  [["filtro-categorias", "categorias"], ["filtro-tipos", "tipos"], ["filtro-marcas", "marcas"]].forEach(([id, clave]) => {
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