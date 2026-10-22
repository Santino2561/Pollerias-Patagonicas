// Carrusel
let imagenes = document.querySelectorAll(".carrusel-imagenes img");
let puntos = document.querySelectorAll(".punto");
let anterior = document.querySelector(".anterior");
let siguiente = document.querySelector(".siguiente");

if (imagenes.length > 0) {
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
}