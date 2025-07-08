import { displayClients, displayProducts, displaySales, displayStock } from './pagination.js';
import { deleteClient, deleteProduct, confirmDeleteListeners } from './modal.js';

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
        
   const precoInput = document.getElementById('productPrice');
    if (precoInput) {
        precoInput.addEventListener('input', function (event) {
            let valor = event.target.value.replace(/\D/g, '');

            if (valor.length === 0) {
                event.target.value = 'R$ 0,00';
                return;
            }

            valor = (parseFloat(valor) / 100).toFixed(2);
            valor = valor
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            event.target.value = 'R$ ' + valor;
        });
    }

   function setupSearch(inputId, endpoint, displayCallback, paramName) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.addEventListener('input', async () => {
                const query = inputElement.value.toLowerCase().trim();

                try {
                    const response = await fetch(`/${endpoint}?${paramName}=${encodeURIComponent(query)}`);
                    if (!response.ok) return displayCallback([]);
                    const results = await response.json();
                    displayCallback(results);
                } catch (error) {
                    console.error(`Erro ao buscar em /${endpoint}:`, error);
                }
            });
        }
    }

    setupSearch('search_input', 'buscar', displayClients, 'nome');
    setupSearch('search_product_input', 'buscarProduto', displayProducts, 'nomeProduto');
    setupSearch('search_stock_input', 'buscarEstoque', displayStock, 'pesquisa');
    setupSearch('search_sales_input', 'buscarVenda', displaySales, 'pesquisa');

    displayClients();
    displayProducts();
    displayStock();
    displaySales();
    confirmDeleteListeners();
});

