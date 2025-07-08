import { openSidebar } from './sideBar.js';

export let currentPage = 1;
let currentProductPage = 1;
let currentStockPage = 1;
let currentSalePage = 1;
const itemsPerPage = 10;
const productItemsPerPage = 10;
const stockItemsPerPage = 10;
const saleItemsPerPage = 10;

function renderPagination(dataList, totalPages, currentPage, updateFunction) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'pagination_button';
        button.textContent = i;
        if (i === currentPage) button.classList.add('active');

        button.addEventListener('click', () => {
            updateFunction(dataList, i);
        });

        paginationContainer.appendChild(button);
    }

    return paginationContainer;
}

export async function displayClients(cliente = null, page = 1) {
    const listContainer = document.getElementById('client_list_container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    currentPage = page;

    if (!cliente) {
        const response = await fetch('/cliente');
        cliente = await response.json();
    }

    if (!cliente || cliente.length === 0) {
        const searchInput = document.getElementById('search_input');
        const isSearching = searchInput && searchInput.value.trim().length > 0;

        listContainer.innerHTML = isSearching
            ? '<p class="no_clients_message">Nenhum cliente encontrado.</p>'
            : '<p class="no_clients_message">Nenhum cliente cadastrado.</p>';
        return;
    }

    const totalPages = Math.ceil(cliente.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const clientesPaginados = cliente.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.classList.add('pages_table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    clientesPaginados.forEach((client) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.nome}</td>
            <td>${client.email}</td>
            <td>${client.telefone}</td>
            <td>${client.endereco || '-'}</td>
            <td class="actions_cell">
                <button class="edit_button" onclick="openSidebar(null, '${client.idCliente}')">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteClient('${client.idCliente}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
    listContainer.appendChild(renderPagination(cliente, totalPages, currentPage, displayClients));
}

export async function displayProducts(produto = null, page = 1) {
    const listContainer = document.getElementById('product_list_container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    currentProductPage = page;

    if (!produto) {
        try {
            const response = await fetch('/produto');
            produto = await response.json();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            listContainer.innerHTML = '<p class="no_products_message">Erro ao carregar os produtos.</p>';
            return;
        }
    }

    if (!produto || produto.length === 0) {
        const searchInputProduct = document.getElementById('search_product_input');
        const isSearching = searchInputProduct && searchInputProduct.value.trim().length > 0;

        listContainer.innerHTML = isSearching
            ? '<p class="no_products_message">Nenhum produto encontrado.</p>'
            : '<p class="no_products_message">Nenhum produto cadastrado.</p>';
        return;
    }

    const totalPages = Math.ceil(produto.length / productItemsPerPage);
    const startIndex = (page - 1) * productItemsPerPage;
    const endIndex = startIndex + productItemsPerPage;
    const produtosPaginados = produto.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.classList.add('pages_table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    produtosPaginados.forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nomeProduto}</td>
            <td>${product.descricaoProduto}</td>
            <td>${product.categoriaProduto}</td>
            <td>R$ ${Number(product.precoProduto).toFixed(2)}</td>
            <td class="actions_cell">
                <button class="edit_button" onclick="openSidebar(null, null, '${product.idProduto}')">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteProduct('${product.idProduto}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
    listContainer.appendChild(renderPagination(produto, totalPages, currentProductPage, displayProducts));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('pt-BR');
}

export async function displayStock(estoque = null, page = 1) {
    const listContainer = document.getElementById('stock_list_container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    currentStockPage = page;

    if (!estoque) {
        try {
            const response = await fetch('/estoque');
            estoque = await response.json();

            if (estoque && !Array.isArray(estoque)) {
                estoque = estoque.data || [];
            }

        } catch (error) {
            listContainer.innerHTML = '<p class="no_products_message">Erro ao carregar o estoque.</p>';
            return;
        }
    }

    if (!Array.isArray(estoque)) estoque = [];

    if (estoque.length === 0) {
        const searchInputStock= document.getElementById('search_stock_input');
        const isSearching = searchInputStock && searchInputStock.value.trim().length > 0;

        listContainer.innerHTML = isSearching
            ? '<p class="no_stock_message">Nenhum estoque encontrado.</p>'
            : '<p class="no_stock_message">Nenhum estoque cadastrado.</p>';
        return;
    }

    const totalPages = Math.ceil(estoque.length / stockItemsPerPage);
    const startIndex = (page - 1) * stockItemsPerPage;
    const endIndex = startIndex + stockItemsPerPage;
    const estoquePaginado = estoque.slice(startIndex, endIndex);
        
    const table = document.createElement('table');
    table.classList.add('pages_table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Produto</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Data Entrada</th>
                <th>Validade</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    estoquePaginado.forEach((stock) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.nomeProduto}</td>
            <td>${stock.descricaoProduto}</td>
            <td>${stock.quantidade}</td>
            <td>${formatDate(stock.dataEntrada)}</td>
            <td>${formatDate(stock.validade)}</td>
            <td class="actions_cell">
                <button class="edit_button" onclick="openSidebar(null, null, null,'${stock.idEstoque}')">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteStock('${stock.idEstoque}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
    listContainer.appendChild(renderPagination(estoque, totalPages, currentStockPage, displayStock));
}

export async function displaySales(venda = null, page = 1) {
    const listContainer = document.getElementById('sales_list_container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    currentStockPage = page;

    if (!venda) {
        try {
            const response = await fetch('/venda');
            venda = await response.json();

            if (venda && !Array.isArray(venda)) {
                venda = venda.data || [];
            }

        } catch (error) {
            listContainer.innerHTML = '<p class="no_sales_message">Erro ao carregar a venda.</p>';
            return;
        }
    }

    if (!Array.isArray(venda)) venda = [];

    if (venda.length === 0) {
        const searchInputSale= document.getElementById('search_sales_input');
        const isSearching = searchInputSale && searchInputSale.value.trim().length > 0;

        listContainer.innerHTML = isSearching
            ? '<p class="no_stock_message">Nenhuma venda encontrada.</p>'
            : '<p class="no_stock_message">Nenhuma venda cadastrada.</p>';
        return;
    }

    const totalPages = Math.ceil(venda.length / saleItemsPerPage);
    const startIndex = (page - 1) * saleItemsPerPage;
    const endIndex = startIndex + saleItemsPerPage;
    const vendaPaginada = venda.slice(startIndex, endIndex);
        
    const table = document.createElement('table');
    table.classList.add('pages_table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Data Venda</th>
                <th>Valor Total</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    vendaPaginada.forEach((sale) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.nome}</td>
            <td>${sale.nomeProduto}</td>
            <td>${sale.quantidade}</td>
            <td>R$${sale.precoUnitario}</td>
            <td>${formatDate(sale.dataVenda)}</td>
            <td>R$${sale.valorTotal}</td>
            <td class="actions_cell">
                <button class="edit_button" onclick="openSidebar(null, null, null, null, '${sale.idVenda}')">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteSale('${sale.idVenda}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
    listContainer.appendChild(renderPagination(venda, totalPages, currentSalePage, displaySales));
}