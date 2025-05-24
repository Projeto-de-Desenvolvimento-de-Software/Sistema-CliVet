import { displayClients } from './pagination.js';
import { showMessage } from './messages.js';

let clientToDeleteId = null;

export function deleteClient(id) {
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
           showMessage('Erro ao buscar cliente. Verifique a conexão com o servidor.', 'error');
        });
}

export function confirmDeleteListeners() {
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
}

function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    successModal.style.display = 'flex';
    setTimeout(() => {
        successModal.style.display = 'none';
    }, 800);
}

window.deleteClient = deleteClient;