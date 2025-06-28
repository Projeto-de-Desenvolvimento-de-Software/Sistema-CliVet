const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
        if (dropdown.classList.contains('disabled')) {
            return;
        }
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });

    menu.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const option = event.target; 

            selected.innerText = option.innerText;
            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');

            const allOptions = menu.querySelectorAll('li');
            allOptions.forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        }
    });
});