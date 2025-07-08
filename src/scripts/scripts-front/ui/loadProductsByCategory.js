document.addEventListener("DOMContentLoaded", () => {
    const categoryDropdownItems = document.querySelectorAll('.menu li[data-value]');
    const productMenu = document.getElementById('productMenu');
    const productDropdown = document.getElementById('dropdown');
    const productSelectedSpan = document.getElementById('productSpan');

    categoryDropdownItems.forEach(item => {
        item.addEventListener('click', async () => {
            const selectedCategory = item.getAttribute('data-value');

            document.getElementById('productCategory').textContent = item.textContent;
            productSelectedSpan.textContent = 'Carregando...';

            productMenu.innerHTML = '';

            try {
                const response = await fetch(`/buscarProdutoPorCategoria?categoriaProduto=${selectedCategory}`);

                if (!response.ok) throw new Error('Erro ao buscar produtos');

                const produtos = await response.json();

                produtos.forEach(produto => {
                    const li = document.createElement('li');
                    li.textContent = produto.nomeProduto;
                    li.setAttribute('data-value', produto.idProduto);

                    li.addEventListener('click', () => {
                        productSelectedSpan.textContent = produto.nomeProduto;
                        productSelectedSpan.setAttribute('data-value', produto.idProduto);
                    });
                    
                    productMenu.appendChild(li);
                });

                productSelectedSpan.textContent = 'Selecione um produto';
                productDropdown.classList.remove('disabled');

            } catch (error) {
                console.error('Erro ao buscar produtos por categoria:', error);
                productSelectedSpan.textContent = 'Nenhum produto encontrado';
                productDropdown.classList.add('disabled');
            }
        });
    });
});