document.addEventListener("DOMContentLoaded", () => {
    const sideItems = document.querySelectorAll(".side_item");

    sideItems.forEach(item => {
        item.addEventListener("click", () => {
            sideItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
});
