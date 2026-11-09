// ===== carrito.js =====

// Raíz del sitio, calculada desde donde está este archivo (nav/carrito/carrito.js).
// Sirve igual en local, en Pages (/Pollerias-Patagonicas/) o en un dominio propio.
const RAIZ_SITIO = new URL("../../", document.currentScript.src);

function rutaImagen(ruta) {
    if (!ruta) return new URL("img/logo.png", RAIZ_SITIO).href;
    if (/^(https?:|data:)/.test(ruta)) return ruta;
    // Saca "../../", "./" o "/" del principio: queda la ruta desde la raíz
    const limpia = ruta.replace(/^(\.\.\/)+/, "").replace(/^\.?\//, "");
    return new URL(limpia, RAIZ_SITIO).href;
}

// 1. Inicializamos el carrito leyendo el LocalStorage
let carrito = JSON.parse(localStorage.getItem('carritoPolleria')) || [];

// 2. FUNCIÓN GLOBAL: AGREGAR AL CARRITO (Para que productos.js e inicio.js la puedan usar)
window.agregarAlCarrito = function(producto, cantidadElegida = 1) {
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
        itemExistente.cantidad += cantidadElegida;
    } else {
        carrito.push({ ...producto, cantidad: cantidadElegida });
    }
    
    guardarCarrito();
    actualizarCarrito();
    abrirCarrito();
};

// 3. DIBUJAR EL CARRITO (Paso 1)
window.actualizarCarrito = function() {
    const contenedor = document.getElementById("carrito-body");
    const contador = document.getElementById("contador-carrito");
    const msjError = document.getElementById("mensaje-error");
    
    if (msjError) msjError.style.display = "none";
    if (!contenedor) return;

    contenedor.innerHTML = "";
    let totalItems = 0;
    let subtotal = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<div class="carrito-vacio">El carrito está vacío</div>';
    } else {
        carrito.forEach((producto, index) => {
            totalItems += producto.cantidad;
            subtotal += producto.precio * producto.cantidad;
            
            const div = document.createElement("div");
            div.className = "item-carrito";
            
const imgSrc = rutaImagen(producto.img);
const logo = rutaImagen("");

div.innerHTML = `
    <img src="${imgSrc}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='${logo}'">
                <div class="item-info">
                    <h4>${producto.nombre}</h4>
                    <p>$${producto.precio}</p>
                    <div class="controles-cantidad">
                        <button onclick="restarCantidad(${index})">-</button>
                        <span>${producto.cantidad}</span>
                        <button onclick="sumarCantidad(${index})">+</button>
                    </div>
                </div>
            `;
            contenedor.appendChild(div);
        });
    }

    if (contador) contador.textContent = totalItems;
    
    const spanSubtotal = document.getElementById("precio-subtotal");
    if (spanSubtotal) spanSubtotal.textContent = `$${subtotal}`;
    
    actualizarPreciosCheckout(subtotal);
    guardarCarrito();
};

// 4. BOTONES SUMAR Y RESTAR CANTIDADES
window.sumarCantidad = function(index) {
    carrito[index].cantidad++;
    actualizarCarrito();
};

window.restarCantidad = function(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    actualizarCarrito();
};

// 5. NAVEGACIÓN ENTRE PASOS (De productos a formulario)
const btnContinuar = document.getElementById("btn-continuar-compra");
const btnVolver = document.getElementById("btn-volver-carrito");
const pasoProductos = document.getElementById("paso-productos");
const pasoCheckout = document.getElementById("paso-checkout");

if (btnContinuar) {
    btnContinuar.addEventListener("click", () => {
        if (carrito.length === 0) {
            const msjError = document.getElementById("mensaje-error");
            if(msjError) {
                msjError.style.display = "block";
                setTimeout(() => msjError.style.display = "none", 3000);
            }
            return;
        }
        pasoProductos.style.display = "none";
        pasoCheckout.style.display = "flex";
    });
}

if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        pasoCheckout.style.display = "none";
        pasoProductos.style.display = "flex";
    });
}

// 6. ACTUALIZAR PRECIOS FINALES Y DESCUENTOS (Paso 2)
function actualizarPreciosCheckout(subtotalParam = null) {
    let subtotal = subtotalParam !== null ? subtotalParam : carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

    const selectorPago = document.getElementById("selector-pago");
    const filaDescuento = document.getElementById("fila-descuento");
    const spanDescuento = document.getElementById("precio-descuento");
    const spanTotalFinal = document.getElementById("precio-total");

    let descuento = 0;
    if (selectorPago && selectorPago.value === 'efectivo' && subtotal > 0) {
        descuento = Math.round(subtotal * 0.05);
        if (filaDescuento) filaDescuento.style.display = 'flex';
        if (spanDescuento) spanDescuento.textContent = `-$${descuento}`;
    } else {
        if (filaDescuento) filaDescuento.style.display = 'none';
    }

    let totalFinal = subtotal - descuento;
    if (spanTotalFinal) spanTotalFinal.textContent = `$${totalFinal}`;
}

// Recalcular si el cliente cambia a efectivo o transferencia
document.getElementById("selector-pago")?.addEventListener("change", () => actualizarPreciosCheckout());

// 7. COMPRAR POR WHATSAPP (Armado del mensaje)
document.getElementById("btn-finalizar-compra")?.addEventListener("click", () => {
    if (carrito.length === 0) return;

    const nombre = document.getElementById("form-nombre").value.trim();
    const direccion = document.getElementById("form-direccion").value.trim();
    const notas = document.getElementById("form-notas").value.trim();
    
    if (!nombre || !direccion) {
        alert("Por favor, completá tu nombre y dirección de entrega antes de enviar el pedido.");
        return;
    }

    const selectorPago = document.getElementById("selector-pago");
    const esEfectivo = selectorPago && selectorPago.value === "efectivo";

    let mensaje = "Hola buenas tardes! Quiero realizar el siguiente pedido:%0A%0A";
    let totalPrecio = 0;

    carrito.forEach(prod => {
        mensaje += `- ${prod.cantidad}x ${prod.nombre} ($${prod.precio * prod.cantidad})%0A`;
        totalPrecio += prod.precio * prod.cantidad;
    });

    mensaje += `%0A*Datos de entrega:*%0A`;
    mensaje += `Nombre: ${nombre}%0A`;
    mensaje += `Dirección: ${direccion}%0A`;
    if (notas) mensaje += `Aclaraciones: ${notas}%0A`;

    if (esEfectivo) {
        let descuento = Math.round(totalPrecio * 0.05);
        let totalFinal = totalPrecio - descuento;
        mensaje += `%0A*Medio de pago:* Efectivo (5% OFF)%0A`;
        mensaje += `*Subtotal:* $${totalPrecio}%0A`;
        mensaje += `*Descuento:* -$${descuento}%0A`;
        mensaje += `*Total a pagar: $${totalFinal}*%0A`;
    } else {
        mensaje += `%0A*Medio de pago:* Transferencia / Tarjeta%0A`;
        mensaje += `*Total a pagar: $${totalPrecio}*%0A`;
    }
    
    mensaje += "%0A¡Muchas gracias!";

    // ACÁ REEMPLAZÁ CON TU NÚMERO
    window.open(`https://wa.me/5492984796020?text=${mensaje}`, "_blank");
});

// 8. CONTROLADORES DEL PANEL Y ARRANQUE INICIAL
function guardarCarrito() {
    localStorage.setItem("carritoPolleria", JSON.stringify(carrito));
}

window.abrirCarrito = function() {
    document.getElementById("sidebar-carrito")?.classList.add("abierto");
    document.getElementById("overlay")?.classList.add("activo");
};

window.cerrarCarrito = function() {
    document.getElementById("sidebar-carrito")?.classList.remove("abierto");
    document.getElementById("overlay")?.classList.remove("activo");
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
    document.getElementById("btn-carrito")?.addEventListener("click", abrirCarrito);
    document.getElementById("overlay")?.addEventListener("click", cerrarCarrito);
    
    actualizarCarrito();
});