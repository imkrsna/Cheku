// navbar

let navbar_themes = document.getElementById("navbar__themes");
let navbar_toggle = document.getElementById("navbar__toggle");

load_theme();

// event listners

navbar_toggle.addEventListener("click", toggle_theme);
navbar_themes.querySelectorAll(".navbar__theme").forEach((item) => {
    let theme = item.getAttribute("data-theme");
    item.addEventListener("click", () => {
        navbar_themes.querySelectorAll(".navbar__theme").forEach((item_) => {
            item_.classList.remove("navbar__theme--active");
        });
        localStorage.setItem("theme", theme);
        load_theme();
    });
});

// handlers

function toggle_theme() {
    navbar_themes.classList.toggle("navbar__themes--active");
}

function load_theme() {
    let theme = localStorage.getItem("theme");
    document.body.setAttribute("data-theme", theme);
    navbar_themes.querySelectorAll(".navbar__theme").forEach((item) => {
        if (item.getAttribute("data-theme") == theme) {
            item.classList.add("navbar__theme--active");
        } else {
            item.classList.remove("navbar__theme--active");
        }
    });
}