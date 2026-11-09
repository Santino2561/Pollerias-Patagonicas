// Init
document.addEventListener("DOMContentLoaded", () => {
  iniciarCarrusel();
  cargarDestacados();
  iniciarCarruselIndividual();
});

// Banner
function iniciarCarrusel() {
  let imagenes = document.querySelectorAll(".carrusel-imagenes img");
  let puntos = document.querySelectorAll(".punto");
  let anterior = document.querySelector(".anterior");
  let siguiente = document.querySelector(".siguiente");
  
  if (imagenes.length === 0) return;

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
    temporizador = setInterval(() => mostrarImagen(indice + 1), 4000);
  }

  anterior.addEventListener("click", () => {
    mostrarImagen(indice - 1);
    reiniciarTemporizador();
  });
  
  siguiente.addEventListener("click", () => {
    mostrarImagen(indice + 1);
    reiniciarTemporizador();
  });
  
  puntos.forEach((punto, i) => {
    punto.addEventListener("click", () => {
      mostrarImagen(i);
      reiniciarTemporizador();
    });
  });
  
  reiniciarTemporizador();
}

// Destacados
async function cargarDestacados() {
  try {
    const respuesta = await fetch("./nav/productos/productos.json")
    const productosTotales = await respuesta.json();
    const prodDestacados = [16, 25, 9, 32]; 
 const destacados = productosTotales
      .filter((producto) => prodDestacados.includes(producto.id))
      .map((producto) => ({
        ...producto,
        // el json usa rutas pensadas para nav/productos/; desde el index (raíz) hay que ajustarlas
        img: producto.img ? producto.img.replace("../../", "./") : "",
      }));

    dibujarDestacados(destacados);
  } catch (error) {
    console.error("Error cargando destacados:", error);
  }
}

function dibujarDestacados(destacados) {
  const contenedor = document.getElementById("contenedor-destacados");
  if (!contenedor) return;
  contenedor.textContent = "";

  destacados.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

 let img;
    if (producto.img) {
      img = document.createElement("img");
      img.src = producto.img;
      img.alt = producto.nombre;
    } else {
      img = document.createElement("div");
      img.className = "img-placeholder";
      img.textContent = "🍗";
    }

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${producto.precio} `;

    const unidad = document.createElement("small");
    unidad.textContent = `/ ${producto.unidad}`;
    precio.appendChild(unidad);

    const btn = document.createElement("button");
    btn.className = "btn-agregar";
    btn.textContent = "Agregar al carrito";
    
    btn.addEventListener("click", () => window.agregarAlCarrito(producto));

    tarjeta.append(img, titulo, precio, btn);
    contenedor.appendChild(tarjeta);
  });

  // La animación mueve -50%: para que el bucle no "salte" tiene que haber un
  // número par de copias del set, y cada mitad debe cubrir el ancho de la pantalla.
  const originales = Array.from(contenedor.children);
  const anchoSet = contenedor.scrollWidth || 1000;
  const copiasPorMitad = Math.max(1, Math.ceil(window.innerWidth / anchoSet));
  const totalCopias = copiasPorMitad * 2;

  for (let i = 1; i < totalCopias; i++) {
    originales.forEach((t) => contenedor.appendChild(t.cloneNode(true)));
  }
  
  contenedor.querySelectorAll(".btn-agregar").forEach((boton, index) => {
    const prodClonado = destacados[index % destacados.length];
    const btnLimpio = boton.cloneNode(true);
    boton.replaceWith(btnLimpio);
    
    btnLimpio.addEventListener("click", () => window.agregarAlCarrito(prodClonado));
  });
}

// Ofertas y combos
let temporizadorOfertas;

function iniciarCarruselIndividual() {
  const secciones = Array.from(document.querySelectorAll(".seccion-carrusel"));
  const todasLasOfertas = document.querySelectorAll(".seccion-carrusel .oferta");
  const tituloSeccion = document.getElementById("titulo-seccion");
  if (secciones.length === 0 || todasLasOfertas.length === 0) return;

  const nombreSeccion = (seccion) =>
    seccion.id === "seccion-ofertas" ? "Ofertas" : "Combos";

  let indiceTarjeta = 0; // celular: qué tarjeta se muestra
  let indiceSeccion = 0; // PC: qué sección se muestra
  let anchoPrevio = window.innerWidth;

  function rotar() {
    if (window.innerWidth <= 768) {
      // Celular: las dos secciones quedan "encendidas" y se muestra una tarjeta por vez
      secciones.forEach((s) => s.classList.add("activa"));
      todasLasOfertas.forEach((oferta, i) =>
        oferta.classList.toggle("visible", i === indiceTarjeta)
      );
      if (tituloSeccion) {
        const seccionActual = todasLasOfertas[indiceTarjeta].closest(".seccion-carrusel");
        tituloSeccion.textContent = nombreSeccion(seccionActual);
      }
      indiceTarjeta = (indiceTarjeta + 1) % todasLasOfertas.length;
    } else {
      // PC: una sección por vez, alternando
      todasLasOfertas.forEach((oferta) => oferta.classList.remove("visible"));
      secciones.forEach((s, i) => s.classList.toggle("activa", i === indiceSeccion));
      if (tituloSeccion) tituloSeccion.textContent = nombreSeccion(secciones[indiceSeccion]);
      indiceSeccion = (indiceSeccion + 1) % secciones.length;
    }
  }

  function ciclo() {
    rotar();
    clearTimeout(temporizadorOfertas);
    const espera = window.innerWidth <= 768 ? 4000 : 6000; // milisegundos
    temporizadorOfertas = setTimeout(ciclo, espera);
  }

  ciclo();

  // Solo reinicia si cambió el ancho (en celular, el scroll dispara "resize" por la barra del navegador)
  window.addEventListener("resize", () => {
    if (window.innerWidth === anchoPrevio) return;
    anchoPrevio = window.innerWidth;
    indiceTarjeta = 0;
    indiceSeccion = 0;
    ciclo();
  });
}