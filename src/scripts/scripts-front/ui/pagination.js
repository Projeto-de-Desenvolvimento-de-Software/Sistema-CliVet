import { openSidebar } from './sideBar.js';

export let currentPage = 1;
const itemsPerPage = 10;

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
                <button class="edit_button" onclick="openSidebar(null, '${client.id}')">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteClient('${client.id}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
    renderPagination(cliente, totalPages);
}

function renderPagination(cliente, totalPages) {
    const listContainer = document.getElementById('client_list_container');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'pagination_button';
        button.textContent = i;
        if (i === currentPage) button.classList.add('active');

        button.addEventListener('click', () => {
            displayClients(cliente, i);
        });

        paginationContainer.appendChild(button);
    }

    listContainer.appendChild(paginationContainer);
}

export async function displayProducts(produto = null) {
        const listContainer = document.getElementById('product_list_container');
        if (!listContainer) return;

    listContainer.innerHTML = '';

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
            ? '<p class="no_products_message">Nenhum Produto encontrado.</p>'
            : '<p class="no_products_message">Nenhum Produto cadastrado.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('products_table');
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

    produto.forEach((product) => {
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

}