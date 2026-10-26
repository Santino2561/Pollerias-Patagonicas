// Carrusel de la tienda: repetir tarjetas hasta cubrir la pantalla
const pista = document.querySelector(".grilla-tienda");

if (pista) {
    const originales = Array.from(pista.children);
    const anchoSet = pista.scrollWidth;
    const veces = Math.max(1, Math.ceil(window.innerWidth / anchoSet));

    // repetir el set hasta superar el ancho de la pantalla
    for (let i = 1; i < veces; i++) {
        originales.forEach(function(tarjeta) {
            pista.appendChild(tarjeta.cloneNode(true));
        });
    }

    // duplicar todo una vez más para que el loop no tenga saltos
    Array.from(pista.children).forEach(function(tarjeta) {
        pista.appendChild(tarjeta.cloneNode(true));
    });
}