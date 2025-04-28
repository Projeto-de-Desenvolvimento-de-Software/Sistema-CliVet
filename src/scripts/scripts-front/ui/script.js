document.addEventListener("DOMContentLoaded", () => {
    const sideItems = document.querySelectorAll(".side_item");

    sideItems.forEach(item => {
        item.addEventListener("click", () => {
            sideItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
});

function openSidebar() {
    document.querySelector('.add_client_sidebar').classList.add('open');
    document.querySelector('.overlay').classList.add('active');
}

function closeSidebar() {
    document.querySelector('.add_client_sidebar').classList.remove('open');
    document.querySelector('.overlay').classList.remove('active');
}