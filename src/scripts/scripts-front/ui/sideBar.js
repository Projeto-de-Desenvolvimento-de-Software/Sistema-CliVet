import { clearMessages, showMessage } from './messages.js';
import { displayClients, displayProducts, displayStock } from './pagination.js';
import { validateFormClient, validateFormProduct, validateFormStock } from './validation.js';

export async function openSidebar(mode = null, id = null, idProduto = null, idEstoque = null) {
    const sidebar = document.querySelector('.add_sidebar');
    const form = document.getElementById('addForm');
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
    } else if (idProduto) {
        try {
           const response = await fetch(`/produto/${idProduto}`);
            if (!response.ok) throw new Error('Erro ao buscar Produto');
            const product = await response.json();

            document.getElementById('productName').value = product.nomeProduto;
            document.getElementById('productDescription').value = product.descricaoProduto || '';
            document.getElementById('productCategory').textContent =  product.categoriaProduto;
            document.getElementById('productPrice').value = product.precoProduto?.toString().replace('.', ',') || '';
            form.querySelector('#editIndex').value = product.idProduto;

            title.textContent = 'Editar Produto';
            saveButton.textContent = 'Atualizar';
        } catch (error) {
            showMessage('Erro ao carregar dados do produto.', 'error');
            return;
        }
    } else if (idEstoque) {
        try {
            const response = await fetch(`/estoque/${idEstoque}`);
            if (!response.ok) throw new Error('Erro ao buscar estoque');
            const stock = await response.json();

            if (stock.categoriaProduto) {
                const categoryValueFromDB = stock.categoriaProduto; 
                const menuItem = document.querySelector(`.menu li[data-value="${categoryValueFromDB}"]`);

                if (menuItem) {
                    document.getElementById('productCategory').textContent = menuItem.textContent;
                } else {
                    document.getElementById('productCategory').textContent = categoryValueFromDB;
                }
            }
        
            const productSpan = document.getElementById('productSpan');
            if (productSpan && stock.nomeProduto) {
                productSpan.textContent = stock.nomeProduto; 
                productSpan.setAttribute('data-value', stock.idProduto);
            }

            document.getElementById('inputQuantity').value = stock.quantidade;

            if (stock.dataEntrada) {
            document.getElementById('stockEntryDate').value = stock.dataEntrada.slice(0, 10);
            }
            if (stock.validade) {
                document.getElementById('stockExpiryDate').value = stock.validade.slice(0, 10);
            }
        
            form.querySelector('#editIndex').value = stock.idEstoque;

            title.textContent = 'Editar Estoque';
            saveButton.textContent = 'Atualizar';
        } catch (error) {
            showMessage('Erro ao carregar dados do estoque.', 'error');
            return;
        }
    } else {
        if (mode === 'addProduct') {
            title.textContent = 'Adicionar Produto';

        } else if (mode === 'addClient'){
            title.textContent = 'Adicionar Cliente';

        } else {
            title.textContent = 'Adicionar Estoque';
        }
        saveButton.textContent = 'Salvar';
    }

    sidebar.classList.add('open');
    document.querySelector('.overlay').classList.add('active');
}

export function closeSidebar() {
    const sidebar = document.querySelector('.add_sidebar');
    const form = document.getElementById('addForm');
    const title = sidebar.querySelector('.title_sidebar');
    const saveButton = form.querySelector('.add_button');

    sidebar.classList.remove('open');
    document.querySelector('.overlay').classList.remove('active');

    if (form) {
        form.reset();
        form.querySelector('#editIndex').value = '';
        document.getElementById('productCategory').textContent = 'Selecione uma categoria';
        document.getElementById('productSpan').textContent = 'Selecione a categoria';
    }

    saveButton.textContent = 'Salvar';
    clearMessages();
}

export async function saveOrUpdateClient() {
    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const addressInput = document.getElementById('clientAddress');
    const form = document.getElementById('addForm');
    const editIndexInput = form.querySelector('#editIndex');

    const name = nameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;
    const clientId = editIndexInput.value;

    if (!validateFormClient(name, email, phone)) return;

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
        if (!response.ok) throw new Error(data.error || 'Erro ao salvar cliente');

        
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

export async function saveOrUpdateProduct() {
    const productNameInput = document.getElementById('productName');
    const productDescriptionInput = document.getElementById('productDescription');
    const productCategoryInput = document.getElementById('productCategory');
    const productPriceInput = document.getElementById('productPrice');
    const form = document.getElementById('addForm');
    const editIndexInput = form.querySelector('#editIndex');
    
    const productName = productNameInput.value;
    const productDescription = productDescriptionInput.value;
    const productCategory = productCategoryInput.textContent;
    const productPrice = productPriceInput.value;
    const productId = editIndexInput.value;

      const numericPrice = parseFloat(
        productPrice
            .replace(/[R$\s.]/g, '') 
            .replace(',', '.')     
      )

    const productData = {
        nomeProduto: productName.trim(),
        descricaoProduto: productDescription.trim(),
        categoriaProduto: productCategory.trim(),
        precoProduto: numericPrice
    };

    if (!validateFormProduct(productName, productCategory, productPrice)) return;

    try {

    let response;

        if (productId) {
            response = await fetch(`/produto/editar/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch('/produto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao salvar Produto');

         const successMessage = productId
            ? 'Produto atualizado com sucesso!'
            : 'Produto salvo com sucesso!';
        showMessage(successMessage, 'success');
        
        form.reset();
        editIndexInput.value = '';

        await displayProducts();

        setTimeout(() => {
            clearMessages();
            closeSidebar();
        }, 500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

export async function saveOrUpdateStock() {
    const productCategory = document.getElementById('productCategory').textContent;
    const productLoaded = document.getElementById('productSpan').getAttribute('data-value');
    const productQuantity = document.getElementById('inputQuantity').value;
    const entryDate = document.getElementById('stockEntryDate').value;
    const expireDate = document.getElementById('stockExpiryDate').value;
    const form = document.getElementById('addForm');
    const editIndexInput = form.querySelector('#editIndex');

    if (!productLoaded) {
        showMessage('O campo Produto é obrigatório.', 'error');
        return; 
    }

    const stockId = editIndexInput.value;

    const numericQuantity = parseInt(productQuantity);

    const stockData = {
        idProduto: productLoaded.trim(),
        quantidade: numericQuantity,
        dataEntrada: entryDate,
        validade: expireDate    
    };

    if (!validateFormStock(productCategory, numericQuantity, entryDate, expireDate)) return;

    try {

    let response;

        if (stockId) {
            response = await fetch(`/estoque/editar/${stockId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stockData)
            });
        } else {
            response = await fetch('/estoque', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockData)
        });
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao salvar Estoque');

         const successMessage = stockId
            ? 'Estoque atualizado com sucesso!'
            : 'Estoque salvo com sucesso!';
        showMessage(successMessage, 'success');
        
        form.reset();
        editIndexInput.value = '';

        await displayStock();

        setTimeout(() => {
            clearMessages();
            closeSidebar();
        }, 500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.saveOrUpdateClient = saveOrUpdateClient;
window.saveOrUpdateProduct = saveOrUpdateProduct;
window.saveOrUpdateStock = saveOrUpdateStock; 