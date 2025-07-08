document.getElementById('increment').addEventListener('click', () => {
    stepper('increment');
});

document.getElementById('decrement').addEventListener('click', () => {
    stepper('decrement');
});

function stepper(action) {
    const input = document.getElementById('inputQuantity');
    const min = parseInt(input.min);
    const val = parseInt(input.value);

    if (action === 'increment') {
        input.value = val + 1;
    } else if (action === 'decrement' && val > min) {
        input.value = val - 1;
    }

    updateTotalValue();
}

