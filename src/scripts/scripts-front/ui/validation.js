import { showMessage, clearMessages } from './messages.js';

export function validateFormClient(name, email, phone) {
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

export function validateFormProduct(productName, productCategory, productPrice) {
    clearMessages();
    if (!productName.trim()) {
        showMessage('O campo Nome do Produto é obrigatório.', 'error');
        return false;
    }

    if (productCategory == 'Selecione uma categoria') {
        showMessage('O campo Categoria é obrigatório.', 'error');
        return false;
    }

    if (!productPrice.trim()) {
        showMessage('O campo Preço é obrigatório.', 'error');
        return false;
    }
    return true;
}

export function validateFormStock(productCategory, numericQuantity, entryDate, expireDate) {
    clearMessages();
    
    if (productCategory == 'Selecione uma categoria') {
        showMessage('O campo Categoria é obrigatório.', 'error');
        return false;
    }

    if (!numericQuantity) {
        showMessage('O campo Quantidade é obrigatório.', 'error');
        return false;
    }

    if (!entryDate) {
        showMessage('O campo Data Entrada é obrigatório.', 'error');
        return false;
    }

    if (expireDate && expireDate <= entryDate) {
        showMessage('A data de validade deve ser posterior à data de entrada.', 'error');
        return false;
    }

    return true;
}

export function validateFormSales(clientLoaded, productLoaded, productQuantity, saleDate) {
    clearMessages();

    if (clientLoaded == null) {
        showMessage('O campo Cliente é obrigatório.', 'error');
        return false;
    }

    if (productLoaded == null) {
        showMessage('O campo Produto é obrigatório.', 'error');
        return false;
    }

    if (!productQuantity) {
        showMessage('O campo Quantidade é obrigatório.', 'error');
        return false;
    }

    if (!saleDate) {
        showMessage('O campo Data Venda é obrigatório.', 'error');
        return false;
    }

    return true;
}