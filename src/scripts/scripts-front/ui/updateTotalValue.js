const decrementButton = document.getElementById('decrement');
const incrementButton = document.getElementById('increment');
const quantityInput = document.getElementById('inputQuantity');
const unitPriceInput = document.getElementById('productPrice');
const totalValueInput = document.getElementById('totalValue');

function parseCurrency(value) {
    if (!value) return 0;
    return parseFloat(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
}

function updateTotalValue() {
    const unitPrice = parseCurrency(unitPriceInput.value);
    const quantity = parseInt(quantityInput.value, 10) || 0;

    const total = unitPrice * quantity;

    totalValueInput.value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(total);
}

quantityInput.addEventListener('input', updateTotalValue);