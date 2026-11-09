/* Sanguchito */
const btnMenu = document.getElementById("btn-menu");
const menuPrincipal = document.getElementById("menu-principal");

if (btnMenu && menuPrincipal) {

  btnMenu.addEventListener("click", (e) => {
    e.preventDefault();
    menuPrincipal.classList.toggle("abierto");
  });

  document.addEventListener("click", (e) => {
    if (
      menuPrincipal.classList.contains("abierto") && 
      !menuPrincipal.contains(e.target) && 
      !btnMenu.contains(e.target)
    ) {
      menuPrincipal.classList.remove("abierto");
    }
  });
}

/* Acordeon */
const linkProductos = document.getElementById("link-productos");
const submenuProductos = document.getElementById("submenu-productos");

if (linkProductos && submenuProductos) {
  linkProductos.addEventListener("click", function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault(); 
      e.stopPropagation(); 
      
      submenuProductos.classList.toggle("desplegado");
      this.parentElement.classList.toggle("activo");
    }
  });
}