import { displayClients } from './pagination.js';
import { deleteClient, confirmDeleteListeners } from './modal.js';

document.addEventListener("DOMContentLoaded", () => {
    const sideItems = document.querySelectorAll(".side_item");

    sideItems.forEach(item => {
        item.addEventListener("click", () => {
            sideItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    const telefoneInput = document.getElementById('clientPhone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function (event) {
            let valor = event.target.value.replace(/\D/g, '');
            valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); 
            valor = valor.replace(/(\d{5})(\d{4})$/, '$1-$2'); 
            event.target.value = valor;
        });
    }

    const searchInput = document.getElementById('search_input');
    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            const query = searchInput.value.toLowerCase().trim();

            try {
                const response = await fetch(`/buscar?nome=${encodeURIComponent(query)}`);
                if (!response.ok) return displayClients([]);
                const cliente = await response.json();
                displayClients(cliente);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            }
        });
    }

    displayClients();
    confirmDeleteListeners();
});

