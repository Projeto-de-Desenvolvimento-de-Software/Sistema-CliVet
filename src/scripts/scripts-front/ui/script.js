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

function openSidebar() {
    document.querySelector('.add_client_sidebar').classList.add('open');
    document.querySelector('.overlay').classList.add('active');
    clearMessages(); // Clear messages when opening
}

function closeSidebar() {
    document.querySelector('.add_client_sidebar').classList.remove('open');
    document.querySelector('.overlay').classList.remove('active');
    // Clear form fields when closing sidebar
    const form = document.getElementById('addClientForm');
    if (form) {
        form.reset();
    }
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
        // Insert message container inside the sidebar, before the form title
        const title = sidebar.querySelector('.title_sidebar');
        if (sidebar && title) {
            sidebar.insertBefore(messageContainer, title.nextSibling); // Insert after the title
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
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.address || '-'}</td>
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
}

function validateForm(name, email, phone) {
    clearMessages(); // Clear previous messages before new validation

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

    // Email Format Validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
        showMessage('Formato de email inválido. Use o formato nome@dominio.com.', 'error');
        return false;
    }

    // Basic Phone Format Validation (allows numbers, spaces, (), -)
    const phoneRegex = /^[0-9\s()\-]+$/;
    if (!phoneRegex.test(phone.trim())) {
        showMessage('Formato de telefone inválido. Use apenas números, espaços, parênteses ou hífens.', 'error');
        return false;
    }

    return true; // All validations passed
}

function saveClientAndDisplay() {
    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const addressInput = document.getElementById('clientAddress');
    const form = document.getElementById('addClientForm');

    const name = nameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;

    if (!validateForm(name, email, phone)) {
        return; // Stop if validation fails
    }

    const newClient = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim()
    };

    clients.push(newClient);
    displayClients(); // Update the list display

    showMessage('Cliente salvo com sucesso!', 'success'); // Show success message (handled in next step)

    form.reset(); // Clear the form

    // Hide success message after a delay and then close sidebar
    setTimeout(() => {
        clearMessages();
        closeSidebar();
    }, 2000); // Close after 2 seconds
}

