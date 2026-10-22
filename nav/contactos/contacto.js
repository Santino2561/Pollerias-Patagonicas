const form = document.getElementById('form-contacto');
    const estado = document.getElementById('estado');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        estado.className = '';

        if (!form.checkValidity()) {
            estado.textContent = 'Completá todos los campos con datos válidos.';
            estado.className = 'error';
            form.reportValidity();
            return;
        }

        const datos = Object.fromEntries(new FormData(form));

        console.log('Datos del formulario:', datos);

        estado.textContent = 'Gracias, recibimos tu mensaje y te respondemos pronto.';
        estado.className = 'ok';
        form.reset();
    });