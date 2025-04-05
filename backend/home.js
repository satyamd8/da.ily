document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.getElementById("open-settings");
    const closeButton = document.querySelector(".close")
    const settings = document.getElementById("settings");

    openButton.addEventListener("click", () => {
        settings.classList.add("open");
        console.log("open settings");
    });

    closeButton.addEventListener("click", () => {
        settings.classList.remove("open");
    });

    settings.addEventListener("click", (e) => {
        if (e.target === settings) {
            settings.classList.remove("open");
        }
    });
});