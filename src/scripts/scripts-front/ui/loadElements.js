document.addEventListener('DOMContentLoaded', async () => {
    const clientDropdown = document.getElementById('clientDropdown');
    const clientSpanSelected = document.getElementById('clientSpan');
    const clientMenu = document.getElementById('clientMenu');
    const productMenu = document.getElementById('productMenu');
    const productDropdown = document.getElementById('dropdown');
    const productSelectedSpan = document.getElementById('productSpanSale');

    clientSpanSelected.textContent = 'Carregando…';

    try {
        const response = await fetch(`/cliente`);

        if (!response.ok) throw new Error('Erro ao buscar clientes');

        const clientes = await response.json();

        clientes.forEach(cliente => {
            const li = document.createElement('li');
            li.textContent = cliente.nome;
            li.setAttribute('data-value', cliente.idCliente);

            li.addEventListener('click', () => {
                clientSpanSelected.textContent = cliente.nome;
                clientSpanSelected.setAttribute('data-value', cliente.idCliente);
            });
            clientMenu.appendChild(li);
        });

        clientSpanSelected.textContent = 'Selecione um cliente';
        clientDropdown.classList.remove('disabled');

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        clientSpanSelected.textContent = 'Nenhum cliente encontrado';
        clientDropdown.classList.add('disabled');
    }

    try {
        const response = await fetch(`/produto`);

        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const produtos = await response.json();

        produtos.forEach(produto => {
            const li = document.createElement('li');
            li.textContent = produto.nomeProduto;
            li.setAttribute('data-value', produto.idProduto);

            li.addEventListener('click', () => {
                productSelectedSpan.textContent = produto.nomeProduto;
                productSelectedSpan.setAttribute('data-value', produto.idProduto);

                const priceInput = document.getElementById('productPrice');

                priceInput.value = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(produto.precoProduto);
            });
            
            productMenu.appendChild(li);
        });

        productSelectedSpan.textContent = 'Selecione um produto';
        productDropdown.classList.remove('disabled');

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productSelectedSpan.textContent = 'Nenhum produto encontrado';
        productDropdown.classList.add('disabled');
    }
});
