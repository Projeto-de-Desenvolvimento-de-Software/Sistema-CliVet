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
            let valor = event.target.value;
            valor = valor.replace(/\D/g, '');
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
                
                if (!response.ok) {
                    displayClients([]);
                    return;
                }
    
                const cliente = await response.json();
                displayClients(cliente); 
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            }
        });
    }

    displayClients();
});

async function openSidebar(id = null) {
    const sidebar = document.querySelector('.add_client_sidebar');
    const form = document.getElementById('addClientForm');
    const title = sidebar.querySelector('.title_sidebar');
    const saveButton = form.querySelector('.add_button');

    form.reset(); 
    clearMessages(); 
    form.querySelector('#editIndex').value = ''; 

  if (id) {
        try {
            const response = await fetch(`/cliente/${id}`);
            if (!response.ok) throw new Error('Erro ao buscar cliente');
            const client = await response.json();

            document.getElementById('clientName').value = client.nome;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.telefone;
            document.getElementById('clientAddress').value = client.endereco || '';
            form.querySelector('#editIndex').value = client.id;

            title.textContent = 'Editar Cliente';
            saveButton.textContent = 'Atualizar';
        } catch (error) {
            showMessage('Erro ao carregar dados do cliente.', 'error');
            return;
        }
    } else {
        title.textContent = 'Adicionar Cliente';
        saveButton.textContent = 'Salvar';
    }

    sidebar.classList.add('open');
    document.querySelector('.overlay').classList.add('active');
}

function closeSidebar() {
    const sidebar = document.querySelector('.add_client_sidebar');
    const form = document.getElementById('addClientForm');
    const title = sidebar.querySelector('.title_sidebar');
    const saveButton = form.querySelector('.add_button');

    sidebar.classList.remove('open');
    document.querySelector('.overlay').classList.remove('active');

    if (form) {
        form.reset();
        form.querySelector('#editIndex').value = '';
    }
    title.textContent = 'Adicionar Cliente';
    saveButton.textContent = 'Salvar';

    clearMessages();
}

function clearMessages() {
    let messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.style.display = 'none';
    }
}

function showMessage(message, type = 'success') {
    let messageContainer = document.getElementById('messageContainer');
    const sidebar = document.querySelector('.add_client_sidebar');

    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        const title = sidebar.querySelector('.title_sidebar');
        if (sidebar && title) {
            sidebar.appendChild(messageContainer, title.nextSibling);
        }
    }

    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageContainer.style.display = 'block';
}

let currentPage = 1;
const itemsPerPage = 10;

async function displayClients(cliente = null, page = 1) {
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

function validateForm(name, email, phone) {
    clearMessages();

    if (!name.trim()) {
        showMessage('O campo Nome Completo é obrigatório.', 'error');
        return false;
    }
    if (!email.trim()) {
        showMessage('O campo Email é obrigatório.', 'error');
        return false;
    }
    if (!phone.trim()) {
        showMessage('O campo Telefone é obrigatório.', 'error');
        return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
        showMessage('Formato de email inválido. Use o formato nome@dominio.com.', 'error');
        return false;
    }

    const phoneRegex = /^[0-9\s()\-]+$/;
    if (!phoneRegex.test(phone.trim())) {
        showMessage('Formato de telefone inválido.', 'error');
        return false;
    }

    const digitCount = phone.replace(/\D/g, '').length;
    if (digitCount > 11 || digitCount < 10) {
        showMessage('Formato de telefone inválido.', 'error');
        return false;
    }

    return true;
}

 async function saveOrUpdateClient() {
    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const addressInput = document.getElementById('clientAddress');
    const form = document.getElementById('addClientForm');
    const editIndexInput = form.querySelector('#editIndex');

    const name = nameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;
    const clientId = editIndexInput.value;

    if (!validateForm(name, email, phone)) {
        return; 
    }

    const clientData = {
        nome: name.trim(),
        email: email.trim(),
        telefone: phone.trim(),
        endereco: address.trim()
    };

   try {
        let response;
        if (clientId) {
            response = await fetch(`/cliente/editar/${clientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
        } else {
            response = await fetch('/cliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
        }

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao salvar cliente');
        }

        if (data.message !== "Nenhuma alteração foi feita.") {
            const successMessage = clientId
                ? 'Cliente atualizado com sucesso!'
                : 'Cliente salvo com sucesso!';
            showMessage(successMessage, 'success');
        }

        form.reset();
        editIndexInput.value = '';

        await displayClients();

        setTimeout(() => {
            clearMessages();
            closeSidebar();
        }, 500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

let clientToDeleteId = null;

function deleteClient(id) {
     clientToDeleteId = id;
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('modalMessage');
   
      fetch(`/cliente/${id}`)
        .then(res => res.json())
        .then(client => {
            message.textContent = `Tem certeza que deseja excluir o cliente ${client.nome}?`;
            modal.style.display = 'flex';
        })
        .catch(() => {
            message.textContent = 'Erro ao buscar cliente.';
            modal.style.display = 'flex';
        });
}

document.getElementById('confirmYes').addEventListener('click', async function () {
    if (clientToDeleteId !== null) {
        try {
            const response = await fetch(`/cliente/${clientToDeleteId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao excluir cliente');
            }
            await displayClients();
            showSuccessModal();
        } catch (error) {
            showMessage(error.message, 'error');
        }
        clientToDeleteId = null;
    }
    document.getElementById('confirmModal').style.display = 'none';
});
 
document.getElementById('confirmNo').addEventListener('click', function () {
    clientToDeleteId = null;
    document.getElementById('confirmModal').style.display = 'none';
});

function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    successModal.style.display = 'flex';
    setTimeout(() => {
        successModal.style.display = 'none';
    }, 800); 
}


