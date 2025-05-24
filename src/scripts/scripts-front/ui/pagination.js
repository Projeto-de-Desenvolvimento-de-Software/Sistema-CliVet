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
    table.classList.add('client_table');
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
                <button class="edit_button" onclick="openSidebar('${client.id}')">
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