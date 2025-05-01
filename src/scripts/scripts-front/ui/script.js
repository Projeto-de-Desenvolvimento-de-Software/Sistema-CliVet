// Existing code...
document.addEventListener("DOMContentLoaded", () => {
    const sideItems = document.querySelectorAll(".side_item");

    sideItems.forEach(item => {
        item.addEventListener("click", () => {
            sideItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // Initial display of clients when the page loads
    displayClients();
});

function openSidebar(editIndex = null) {
    const sidebar = document.querySelector('.add_client_sidebar');
    const form = document.getElementById('addClientForm');
    const title = sidebar.querySelector('.title_sidebar');
    const saveButton = form.querySelector('.add_button');

    form.reset(); // Clear form first
    clearMessages(); // Clear any previous messages
    form.querySelector('#editIndex').value = ''; // Clear edit index

    if (editIndex !== null && clients[editIndex]) {
        // Edit mode: Populate form and change title/button
        const client = clients[editIndex];
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('clientAddress').value = client.address || '';
        form.querySelector('#editIndex').value = editIndex; // Store index being edited
        title.textContent = 'Editar Cliente';
        saveButton.textContent = 'Atualizar';
    } else {
        // Add mode: Reset title/button
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

    // Reset form and edit state
    if (form) {
        form.reset();
        form.querySelector('#editIndex').value = '';
    }
    title.textContent = 'Adicionar Cliente';
    saveButton.textContent = 'Salvar';

    // Clear any previous messages
    clearMessages();
}

// Function to clear messages
function clearMessages() {
    let messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.style.display = 'none';
    }
}

// Function to display messages (validation and success)
function showMessage(message, type = 'success') {
    let messageContainer = document.getElementById('messageContainer');
    const sidebar = document.querySelector('.add_client_sidebar');

    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        const title = sidebar.querySelector('.title_sidebar');
        if (sidebar && title) {
            sidebar.insertBefore(messageContainer, title.nextSibling);
        }
    }

    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageContainer.style.display = 'block';
}

// Placeholder for client data
let clients = [];

function displayClients() {
    const listContainer = document.getElementById('client_list_container');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Clear existing list

    if (clients.length === 0) {
        listContainer.innerHTML = '<p class="no_clients_message">Nenhum cliente cadastrado ainda.</p>';
        return;
    }

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
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    clients.forEach((client, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.address || '-'}</td>
            <td class="actions_cell">
                <button class="edit_button" onclick="openSidebar(${index})">
                    <i class="fa-solid fa-pencil"></i> Editar
                </button>
                <button class="delete_button" onclick="deleteClient(${index})">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
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
        showMessage('Formato de telefone inválido. Use apenas números, espaços, parênteses ou hífens.', 'error');
        return false;
    }

    return true;
}

function saveOrUpdateClient() {
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
    const editIndex = editIndexInput.value;

    if (!validateForm(name, email, phone)) {
        return; // Stop if validation fails
    }

    const clientData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim()
    };

    let successMessage = '';

    if (editIndex !== '' && clients[editIndex]) {
        // Update existing client
        clients[editIndex] = clientData;
        successMessage = 'Cliente atualizado com sucesso!';
    } else {
        // Add new client
        clients.push(clientData);
        successMessage = 'Cliente salvo com sucesso!';
    }

    displayClients(); // Update the list display
    showMessage(successMessage, 'success');
    form.reset();
    editIndexInput.value = ''; // Clear edit index after save/update

    // Hide success message after a delay and then close sidebar
    setTimeout(() => {
        clearMessages();
        closeSidebar();
    }, 2000);
}

function deleteClient(index) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${clients[index].name}?`)) {
        clients.splice(index, 1); // Remove client from array
        displayClients(); // Refresh the list
        showMessage('Cliente excluído com sucesso!', 'success');
    }
}

