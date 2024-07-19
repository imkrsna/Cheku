// import
import {App} from "./storage.js";

// classes
class UI {
    // ui elements
    static add_card_btn = document.getElementById("container__card--add");
    static container_cards = document.getElementById("container__cards");

    // mainloop
    static mainloop() {
        this.conecting_handlers();
        this.refresh_todo_cards();
    }

    // functions

    static conecting_handlers() {
        this.add_card_btn.addEventListener("click", ()=>{this.add_todo_handler();});
    }

    static refresh_todo_cards() {
        this.remove_all_cards_UI();
        let todos = Object.values(App.ls_fetch());
        todos.forEach((item) => {
            this.add_todo_card_UI(item);
        });
    }

    static add_todo_card_UI(card) {
        let card_ui = document.createElement("div");
        card_ui.innerHTML = `
        <li class="container__card" id=${card.id}>
            <button class="card__btn"><img src="./img/trash.svg" alt="trash icon"></button>
            <div class="card__title">${card.title}</div>
        </li>`;
        card_ui = card_ui.querySelector("li");
        card_ui.querySelector(".card__btn").addEventListener("click", this.delete_todo_handler);
        card_ui.addEventListener("click", this.goto_todo_handler);
        this.container_cards.appendChild(card_ui);
    }

    static remove_all_cards_UI() {
        let all_cards = this.container_cards.querySelectorAll(".container__card:not(.container__card--add)");
        all_cards.forEach((item) => {item.remove();});
    }

    // handlers
    
    static add_todo_handler() {
        let todo = App.create_todo("Untitled");
        this.refresh_todo_cards();
    }

    static delete_todo_handler(event) {
        let card = this.parentNode;
        let id = card.getAttribute("id");
        let flag = confirm(`Do you want delete "${card.querySelector(".card__title").innerHTML}"?`);
        if (flag) {
            App.remove_todo(id);
            card.remove();
        }
    }

    static goto_todo_handler(event) {
        if (event.target.classList.contains("container__card")) {
            let id = this.getAttribute("id");
            window.location.href = `/todo.html?id=${id}`;
        }
    }
}

UI.mainloop();