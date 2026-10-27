// ===== inicio.js =====

document.addEventListener("DOMContentLoaded", () => {
    iniciarCarrusel();
    cargarDestacados();
});

// 1. Lógica del Carrusel
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

    anterior.addEventListener("click", () => { mostrarImagen(indice - 1); reiniciarTemporizador(); });
    siguiente.addEventListener("click", () => { mostrarImagen(indice + 1); reiniciarTemporizador(); });
    puntos.forEach((punto, i) => {
        punto.addEventListener("click", () => { mostrarImagen(i); reiniciarTemporizador(); });
    });
    reiniciarTemporizador();
}

// 2. Cargar y dibujar productos destacados
async function cargarDestacados() {
    try {
        const respuesta = await fetch('/nav/productos/productos.json');
        const productosTotales = await respuesta.json();
        const prodDestacados = [16, 25, 9, 32]; 
        const destacados = productosTotales.filter(producto => prodDestacados.includes(producto.id));
        
        dibujarDestacados(destacados);
    } catch (error) {
        console.error('Error cargando destacados:', error);
    }
}

function dibujarDestacados(destacados) {
    const contenedor = document.getElementById("contenedor-destacados");
    if (!contenedor) return;
    contenedor.textContent = "";

    destacados.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";

        const img = document.createElement("img");
        img.src = producto.img;
        img.alt = producto.nombre;

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
        btn.addEventListener("click", () => agregarAlCarrito(producto));

        tarjeta.append(img, titulo, precio, btn);
        contenedor.appendChild(tarjeta);
    });

    // 3. Activar animación de cinta transportadora
    const originales = Array.from(contenedor.children);
    const anchoSet = contenedor.scrollWidth || 1000; 
    const veces = Math.max(1, Math.ceil(window.innerWidth / anchoSet));

    for (let i = 1; i < veces; i++) {
        originales.forEach(t => contenedor.appendChild(t.cloneNode(true)));
    }
    Array.from(contenedor.children).forEach(t => contenedor.appendChild(t.cloneNode(true)));

    // Reconectar botones en los clones
    contenedor.querySelectorAll(".btn-agregar").forEach((boton, index) => {
        const prodClonado = destacados[index % destacados.length];
        const btnLimpio = boton.cloneNode(true);
        boton.replaceWith(btnLimpio);
        btnLimpio.addEventListener("click", () => agregarAlCarrito(prodClonado));
    });
}