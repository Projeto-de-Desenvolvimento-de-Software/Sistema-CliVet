import { displayClients, displayProducts, displayStock, displaySales } from './pagination.js';
import { showMessage } from './messages.js';

let clientToDeleteId = null;
let productToDeleteId = null;
let stockToDeleteId = null;
let saleToDeleteId = null;

export function deleteClient(idCliente) {
    clientToDeleteId = idCliente;
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('modalMessage');

    fetch(`/cliente/${idCliente}`)
        .then(res => res.json())
        .then(client => {
            message.textContent = `Tem certeza que deseja excluir o cliente ${client.nome}?`;
            modal.style.display = 'flex';
        })
        .catch(() => {
           showMessage('Erro ao buscar cliente. Verifique a conexão com o servidor.', 'error');
        });
}

export function deleteProduct(idProduto) {
    productToDeleteId = idProduto;
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('modalMessage');

    fetch(`/produto/${idProduto}`)
        .then(res => res.json())
        .then(product => {
            message.textContent = `Tem certeza que deseja excluir o produto ${product.nomeProduto}?`;
            modal.style.display = 'flex';
        })
        .catch(() => {
            showMessage('Erro ao buscar produto. Verifique a conexão com o servidor.', 'error');
        });
}

export function deleteStock(idEstoque) {
    stockToDeleteId = idEstoque;
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('modalMessage');

    fetch(`/estoque/${idEstoque}`)
        .then(res => res.json())
        .then(stock => {
            message.textContent = `Tem certeza que deseja excluir o estoque do produto ${stock.nomeProduto}?`;
            modal.style.display = 'flex';
        })
        .catch(() => {
            showMessage('Erro ao buscar estoque. Verifique a conexão com o servidor.', 'error');
        });
}

export function deleteSale(idVenda) {
    saleToDeleteId = idVenda;
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('modalMessage');

    fetch(`/venda/${idVenda}`)
        .then(res => res.json())
        .then(sale => {
            message.textContent = `Tem certeza que deseja excluir a venda?`;
            modal.style.display = 'flex';
        })
        .catch(() => {
            showMessage('Erro ao buscar venda. Verifique a conexão com o servidor.', 'error');
        });
}

export function confirmDeleteListeners() {
    document.getElementById('confirmYes').addEventListener('click', async function () {
        try {
            if (clientToDeleteId !== null) {
                const response = await fetch(`/cliente/${clientToDeleteId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao excluir cliente');
                }
                await displayClients();
                showSuccessModal();
                clientToDeleteId = null;

            } else if (productToDeleteId !== null) {
                const response = await fetch(`/produto/${productToDeleteId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao excluir produto');
                }
                await displayProducts();
                showSuccessModal();
                productToDeleteId = null;

            } else if (stockToDeleteId !== null) {
                const response = await fetch(`/estoque/${stockToDeleteId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao excluir estoque');
                }
                await displayStock();
                showSuccessModal();
                stockToDeleteId = null;

            } else if (saleToDeleteId !== null) {
                const response = await fetch(`/venda/${saleToDeleteId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao excluir venda');
                }
                await displaySales();
                showSuccessModal();
                saleToDeleteId = null;
            }

        } catch (error) {
            showMessage(error.message, 'error');
        }

        document.getElementById('confirmModal').style.display = 'none';
    
    });

    document.getElementById('confirmNo').addEventListener('click', function () {
        clientToDeleteId = null;
        productToDeleteId = null;
        stockToDeleteId = null;
        saleToDeleteId = null;
        document.getElementById('confirmModal').style.display = 'none';
    });
}

function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    successModal.style.display = 'flex';
    setTimeout(() => {
        successModal.style.display = 'none';
    }, 800);
}

window.deleteClient = deleteClient;
window.deleteProduct = deleteProduct;
window.deleteStock = deleteStock;
window.deleteSale = deleteSale;