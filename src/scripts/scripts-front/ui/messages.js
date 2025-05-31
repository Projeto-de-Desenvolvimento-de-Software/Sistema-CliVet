export function clearMessages() {
    let messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.style.display = 'none';
    }
}

export function showMessage(message, type = 'success') {
    let messageContainer = document.getElementById('messageContainer');
    const sidebar = document.querySelector('.add_sidebar');

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