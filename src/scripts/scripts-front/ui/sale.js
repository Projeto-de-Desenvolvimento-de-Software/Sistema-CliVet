import { displayMessage, showConfirmModal, showSuccessModal } from './messages.js';
import { openSidebar, closeSidebar } from './sideBar.js';
import { toggleSelector } from './selector.js';
import { increaseQuantity, decreaseQuantity } from './quantityInput.js';

let currentSales = [];
let currentClients = [];
let currentProducts = [];
let selectedSaleItems = [];
let currentPage = 1;
const itemsPerPage = 10;
let isEditMode = false;

// Funções de inicialização
document.addEventListener("DOMContentLoaded", () => {
    loadSales();
    loadClients();
    loadProducts();
    setupEventListeners();
    setupSearch();
});

function setupEventListeners() {
    // Event listeners para os seletores
    document.addEventListener('click', (e) => {
        if (e.target.closest('.selector_display')) {
            const selector = e.target.closest('.selector');
            toggleSelector(selector.id);
        }
    });

    // Event listener para fechar seletores ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector')) {
            document.querySelectorAll('.selector').forEach(selector => {
                selector.classList.remove('active');
            });
        }
    });

    // Event listener para data atual
    const saleDateInput = document.getElementById('sale_date');
    if (saleDateInput) {
        const today = new Date().toISOString().split('T')[0];
        saleDateInput.value = today;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search_client');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            searchSales();
        }, 300));
    }
}

// Função debounce para otimizar pesquisas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Carregar dados
async function loadSales() {
    try {
        const response = await fetch('/venda');
        if (response.ok) {
            currentSales = await response.json();
            displaySales(currentSales);
        } else {
            console.error('Erro ao carregar vendas');
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
    }
}

async function loadClients() {
    try {
        const response = await fetch('/cliente');
        if (response.ok) {
            currentClients = await response.json();
            populateClientSelector();
        } else {
            console.error('Erro ao carregar clientes');
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/produto');
        if (response.ok) {
            currentProducts = await response.json();
            populateProductSelector();
        } else {
            console.error('Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// População dos seletores
function populateClientSelector() {
    const clientOptions = document.getElementById('client_options');
    if (!clientOptions) return;

    clientOptions.innerHTML = '';
    
    currentClients.forEach(client => {
        const option = document.createElement('div');
        option.className = 'selector_option';
        option.textContent = client.nome;
        option.onclick = () => selectClient(client);
        clientOptions.appendChild(option);
    });
}

function populateProductSelector() {
    const productOptions = document.getElementById('product_options');
    if (!productOptions) return;

    productOptions.innerHTML = '';
    
    currentProducts.forEach(product => {
        const option = document.createElement('div');
        option.className = 'selector_option';
        option.innerHTML = `
            <div class="product_option">
                <span class="product_name">${product.nomeProduto}</span>
                <span class="product_category">${product.categoriaProduto}</span>
                <span class="product_price">R$ ${parseFloat(product.precoProduto).toFixed(2)}</span>
            </div>
        `;
        option.onclick = () => selectProduct(product);
        productOptions.appendChild(option);
    });
}

// Seleção de cliente e produto
function selectClient(client) {
    document.getElementById('selected_client').textContent = client.nome;
    document.getElementById('selected_client').dataset.clientId = client.idCliente;
    document.getElementById('client_selector').classList.remove('active');
}

function selectProduct(product) {
    document.getElementById('selected_product').textContent = product.nomeProduto;
    document.getElementById('selected_product').dataset.productId = product.idProduto;
    document.getElementById('product_price').value = parseFloat(product.precoProduto).toFixed(2);
    document.getElementById('product_selector').classList.remove('active');
}

// Gerenciamento de produtos na venda
function addProductToSale() {
    const selectedProductElement = document.getElementById('selected_product');
    const productId = selectedProductElement.dataset.productId;
    const productName = selectedProductElement.textContent;
    const quantity = parseInt(document.getElementById('product_quantity').value);
    const price = parseFloat(document.getElementById('product_price').value);

    if (!productId || productId === 'undefined') {
        displayMessage('Selecione um produto', 'error');
        return;
    }

    if (quantity <= 0) {
        displayMessage('Quantidade deve ser maior que zero', 'error');
        return;
    }

    if (price <= 0) {
        displayMessage('Preço deve ser maior que zero', 'error');
        return;
    }

    // Verificar se o produto já foi adicionado
    const existingIndex = selectedSaleItems.findIndex(item => item.fk_Produto_idProduto == productId);
    
    if (existingIndex !== -1) {
        // Atualizar quantidade e preço do produto existente
        selectedSaleItems[existingIndex].quantidade += quantity;
        selectedSaleItems[existingIndex].precoUnitario = price;
    } else {
        // Adicionar novo produto
        selectedSaleItems.push({
            fk_Produto_idProduto: productId,
            nomeProduto: productName,
            quantidade: quantity,
            precoUnitario: price
        });
    }

    updateSelectedProductsList();
    clearProductSelection();
}

function updateSelectedProductsList() {
    const container = document.getElementById('selected_products_list');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    selectedSaleItems.forEach((item, index) => {
        const subtotal = item.quantidade * item.precoUnitario;
        total += subtotal;

        const productDiv = document.createElement('div');
        productDiv.className = 'selected_product_item';
        productDiv.innerHTML = `
            <div class="product_info">
                <span class="product_name">${item.nomeProduto}</span>
                <span class="product_details">Qtd: ${item.quantidade} x R$ ${item.precoUnitario.toFixed(2)}</span>
            </div>
            <div class="product_actions">
                <span class="product_subtotal">R$ ${subtotal.toFixed(2)}</span>
                <button type="button" class="remove_product_button" onclick="removeProductFromSale(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(productDiv);
    });

    document.getElementById('sale_total').textContent = total.toFixed(2);
}

function removeProductFromSale(index) {
    selectedSaleItems.splice(index, 1);
    updateSelectedProductsList();
}

function clearProductSelection() {
    document.getElementById('selected_product').textContent = 'Selecione um produto';
    document.getElementById('selected_product').dataset.productId = '';
    document.getElementById('product_quantity').value = '1';
    document.getElementById('product_price').value = '';
}

// Exibição das vendas
function displaySales(sales) {
    const container = document.getElementById('sale_list_container');
    if (!container) return;

    if (sales.length === 0) {
        container.innerHTML = '<p class="no_data">Nenhuma venda encontrada.</p>';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSales = sales.slice(startIndex, endIndex);

    container.innerHTML = `
        <div class="data_table">
            <div class="table_header">
                <div class="header_item">ID</div>
                <div class="header_item">Cliente</div>
                <div class="header_item">Data</div>
                <div class="header_item">Valor Total</div>
                <div class="header_item">Ações</div>
            </div>
            ${paginatedSales.map(sale => `
                <div class="table_row">
                    <div class="table_item">${sale.idVenda}</div>
                    <div class="table_item">${sale.nomeCliente}</div>
                    <div class="table_item">${formatDate(sale.dataVenda)}</div>
                    <div class="table_item">R$ ${parseFloat(sale.valorTotal).toFixed(2)}</div>
                    <div class="table_item actions">
                        <button class="action_button view" onclick="viewSaleDetails(${sale.idVenda})" title="Ver detalhes">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action_button edit" onclick="editSale(${sale.idVenda})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action_button delete" onclick="deleteSale(${sale.idVenda})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    updatePagination(sales.length);
}

function updatePagination(totalItems) {
    const container = document.getElementById('pagination_container');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';
    
    // Botão anterior
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination_button" onclick="changePage(${currentPage - 1})">Anterior</button>`;
    }
    
    // Números das páginas
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="pagination_button ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Botão próximo
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination_button" onclick="changePage(${currentPage + 1})">Próximo</button>`;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    displaySales(currentSales);
}

// Pesquisa de vendas
async function searchSales() {
    const clientName = document.getElementById('search_client').value.trim();
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    try {
        let url = '/buscarVenda?';
        const params = [];

        if (clientName) params.push(`cliente=${encodeURIComponent(clientName)}`);
        if (startDate) params.push(`dataInicio=${startDate}`);
        if (endDate) params.push(`dataFim=${endDate}`);

        url += params.join('&');

        const response = await fetch(url);
        
        if (response.ok) {
            const sales = await response.json();
            currentSales = sales;
            currentPage = 1;
            displaySales(sales);
        } else if (response.status === 404) {
            currentSales = [];
            displaySales([]);
        } else {
            console.error('Erro ao buscar vendas');
        }
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
    }
}

// Operações CRUD
async function saveOrUpdateSale() {
    const clientElement = document.getElementById('selected_client');
    const clientId = clientElement.dataset.clientId;
    const saleDate = document.getElementById('sale_date').value;
    const editSaleId = document.getElementById('editSaleId').value;

    if (!clientId || clientId === 'undefined') {
        displayMessage('Selecione um cliente', 'error');
        return;
    }

    if (!saleDate) {
        displayMessage('Informe a data da venda', 'error');
        return;
    }

    if (selectedSaleItems.length === 0) {
        displayMessage('Adicione pelo menos um produto à venda', 'error');
        return;
    }

    const total = selectedSaleItems.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);

    const saleData = {
        dataVenda: saleDate,
        valorTotal: total,
        fk_Cliente_idCliente: parseInt(clientId),
        itens: selectedSaleItems
    };

    try {
        let response;
        if (isEditMode && editSaleId) {
            response = await fetch(`/venda/editar/${editSaleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData)
            });
        } else {
            response = await fetch('/venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData)
            });
        }

        if (response.ok) {
            const result = await response.json();
            showSuccessModal(isEditMode ? 'Venda atualizada com sucesso!' : 'Venda criada com sucesso!');
            closeSidebar();
            clearSaleForm();
            loadSales();
        } else {
            const error = await response.json();
            displayMessage(error.error || 'Erro ao salvar venda', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar venda:', error);
        displayMessage('Erro ao salvar venda', 'error');
    }
}

async function editSale(saleId) {
    try {
        const response = await fetch(`/venda/${saleId}`);
        if (response.ok) {
            const sale = await response.json();
            
            // Preencher formulário
            document.getElementById('editSaleId').value = sale.idVenda;
            document.getElementById('sale_date').value = sale.dataVenda.split('T')[0];
            
            // Selecionar cliente
            const clientElement = document.getElementById('selected_client');
            clientElement.textContent = sale.nomeCliente;
            clientElement.dataset.clientId = sale.fk_Cliente_idCliente;
            
            // Carregar itens da venda
            selectedSaleItems = sale.itens.map(item => ({
                fk_Produto_idProduto: item.fk_Produto_idProduto,
                nomeProduto: item.nomeProduto,
                quantidade: item.quantidade,
                precoUnitario: parseFloat(item.precoUnitario)
            }));
            
            updateSelectedProductsList();
            
            isEditMode = true;
            document.querySelector('.title_sidebar').textContent = 'Editar Venda';
            openSidebar('editSale');
        } else {
            displayMessage('Erro ao carregar dados da venda', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar venda:', error);
        displayMessage('Erro ao carregar venda', 'error');
    }
}

async function deleteSale(saleId) {
    showConfirmModal(
        'Tem certeza que deseja excluir esta venda?',
        async () => {
            try {
                const response = await fetch(`/venda/${saleId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showSuccessModal('Venda excluída com sucesso!');
                    loadSales();
                } else {
                    const error = await response.json();
                    displayMessage(error.error || 'Erro ao excluir venda', 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir venda:', error);
                displayMessage('Erro ao excluir venda', 'error');
            }
        }
    );
}

async function viewSaleDetails(saleId) {
    try {
        const response = await fetch(`/venda/${saleId}`);
        if (response.ok) {
            const sale = await response.json();
            showSaleDetailsModal(sale);
        } else {
            displayMessage('Erro ao carregar detalhes da venda', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da venda:', error);
        displayMessage('Erro ao carregar detalhes da venda', 'error');
    }
}

function showSaleDetailsModal(sale) {
    const modal = document.getElementById('saleDetailsModal');
    const content = document.getElementById('saleDetailsContent');
    
    const total = sale.itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
    
    content.innerHTML = `
        <div class="sale-details">
            <div class="sale-info">
                <h4>Informações da Venda</h4>
                <p><strong>ID:</strong> ${sale.idVenda}</p>
                <p><strong>Cliente:</strong> ${sale.nomeCliente}</p>
                <p><strong>Email:</strong> ${sale.emailCliente}</p>
                <p><strong>Data:</strong> ${formatDate(sale.dataVenda)}</p>
                <p><strong>Valor Total:</strong> R$ ${parseFloat(sale.valorTotal).toFixed(2)}</p>
            </div>
            <div class="sale-items">
                <h4>Itens da Venda</h4>
                <div class="items-table">
                    <div class="items-header">
                        <div>Produto</div>
                        <div>Categoria</div>
                        <div>Quantidade</div>
                        <div>Preço Unit.</div>
                        <div>Subtotal</div>
                    </div>
                    ${sale.itens.map(item => `
                        <div class="items-row">
                            <div>${item.nomeProduto}</div>
                            <div>${item.categoriaProduto}</div>
                            <div>${item.quantidade}</div>
                            <div>R$ ${parseFloat(item.precoUnitario).toFixed(2)}</div>
                            <div>R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeSaleDetailsModal() {
    document.getElementById('saleDetailsModal').style.display = 'none';
}

function clearSaleForm() {
    document.getElementById('editSaleId').value = '';
    document.getElementById('selected_client').textContent = 'Selecione um cliente';
    document.getElementById('selected_client').dataset.clientId = '';
    document.getElementById('sale_date').value = new Date().toISOString().split('T')[0];
    selectedSaleItems = [];
    updateSelectedProductsList();
    clearProductSelection();
    isEditMode = false;
    document.querySelector('.title_sidebar').textContent = 'Nova Venda';
}

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Expor funções globalmente
window.openSidebar = (type) => {
    if (type === 'addSale') {
        clearSaleForm();
    }
    openSidebar();
};

window.closeSidebar = closeSidebar;
window.toggleSelector = toggleSelector;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addProductToSale = addProductToSale;
window.removeProductFromSale = removeProductFromSale;
window.saveOrUpdateSale = saveOrUpdateSale;
window.editSale = editSale;
window.deleteSale = deleteSale;
window.viewSaleDetails = viewSaleDetails;
window.closeSaleDetailsModal = closeSaleDetailsModal;
window.searchSales = searchSales;
window.changePage = changePage;

