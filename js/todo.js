// imports
import {App, Task, Todo, Utility, API} from "./storage.js";

// classes
class UI {
    // ui elements
    static _404 = document.getElementById("_404");
    static todo_ui = document.getElementById("todo");
    static todo_title_ui = document.getElementById("todo__title");
    static todo_share_btn_ui = document.getElementById("todo__share");
    static todo_input_ui= document.getElementById("todo__input");
    static todo_add_btn_ui = document.getElementById("todo__add");
    static todo_list_ui = document.getElementById("todo__list");

    // logic variables
    static url_id = Utility.get_url_id("id");
    static todo = null;

    // functions
    static mainloop() {
        this.load_todo(this.url_id);
        this.handle_404();
        this.connecting_handlers();
    }
    
    static handle_404() {
        if (this.todo != null) {
            this.todo_ui.classList.remove("hidden");
        } else {
            this._404.classList.remove("hidden");
        }
    }

    static connecting_handlers() {
        this.todo_input_ui.addEventListener("keydown", (e)=>{this.todo_input_enter_handler(e);});
        this.todo_add_btn_ui.addEventListener("click", ()=>{this.add_task_handler();});
        this.todo_title_ui.addEventListener("click", ()=>{this.todo_title_click_handler();});
        this.todo_title_ui.addEventListener("focusout", ()=>{this.todo_title_update_handler();});
        this.todo_share_btn_ui.addEventListener("click", ()=>{API.upload_todo(this.todo.id)});
    }

    
    // ui functions
    static load_todo(id) {
        this.todo = App.ls_fetch()[id] || null;

        if (this.todo != null) {
            this.todo = (new Todo()).assign(this.todo);
            this.todo_title_ui.innerHTML = this.todo.title;
            this.load_tasks_ui();
        }
    }

    static get_all_cards_ui() {
        let cards = this.todo_list_ui.querySelectorAll(".todo__task");
        return cards;
    }

    static find_position(task_id) {
        let cards = this.get_all_cards_ui();
        let position = null;
        for (let i = 0; i < cards.length; i++) {
            let item = cards[i];
            if (item.id == task_id) {
                position = i;
                break;
            }
        }
    }

    static load_tasks_ui() {
        this.clean_tasks_ui();
        let all_tasks = Object.values(this.todo.tasks);
        all_tasks.sort((a,b)=>{return a.position - b.position;});
        all_tasks.forEach((item) => {
            this.add_task_ui(item)
        });
    } 

    // ui handlers

    static todo_title_click_handler() {
        this.todo_title_ui.setAttribute("contenteditable", true);
        this.todo_title_ui.focus();
    }

    static todo_title_update_handler() {
        let title = "Untitled";
        if (this.todo_title_ui.innerHTML.trim() != "") {
            title = this.todo_title_ui.innerHTML;
        } else{
            this.todo_title_ui.innerHTML = title;
        }
        this.todo.title = title;
        App.update_todo(this.todo.id, this.todo);
    }

    static add_task_handler() {
        let text = this.todo_input_ui.value.trim();
        text = (text != "") ? text : "Empty Task";
        let state = false;
        let position = this.get_all_cards_ui().length;
        
        let task = this.todo.add_task(text, state, position);
        this.add_task_ui(task);
        this.todo_input_ui.value = "";
        this.todo_input_ui.focus();
    }

    static todo_input_enter_handler(event) {
        if (event.keyCode == 13) {
            this.todo_add_btn_ui.click();
            this.todo_input_ui.value = "";
            this.todo_input_ui.focus();
        }
    }

    static add_task_ui(task) {
        let task_ui = document.createElement("div");
        task_ui.innerHTML = `
            <li class="todo__task ${task.state ? 'todo__task--active' : ''}" id="${task.id}" draggable=true>
                <div class="todo__check">
                    <img src="./img/check.svg" alt="check icon">
                </div>
                <div class="todo__text">${task.text}</div>
                <div class="todo__btns">
                    <button class="todo__btn todo__btn--update"><img src="./img/pencil.svg" alt="edit icon"></button>
                    <button class="todo__btn todo__btn--remove"><img src="./img/cross.svg" alt="remove icon"></button>
                </div>
            </li>
        `;
        task_ui = task_ui.querySelector("li");
        
        // events
        task_ui.querySelector(".todo__btn--remove").addEventListener("click", ()=>{this.remove_task_btn_handler(task.id);});
        task_ui.querySelector(".todo__btn--update").addEventListener("click", ()=>{this.update_task_btn_handler(task.id);});
        task_ui.querySelector(".todo__text").addEventListener("keydown", (e)=>{this.update_task_text_enter_handler(e, task.id)});
        task_ui.querySelector(".todo__text").addEventListener("focusout", ()=>{this.update_task_text_helper(task.id)});
        task_ui.querySelector(".todo__check").addEventListener("click", ()=>{this.check_btn_handler(task.id)});

        // drag and drop events
        task_ui.addEventListener("dragstart", (e)=>{this.drag_start_task_handler(e, task.id);});
        task_ui.addEventListener("dragend", (e)=>{this.drag_end_task_handler(e, task.id);});
        task_ui.addEventListener("dragover", (e)=>{this.drag_over_task_handler(e, task.id);});

        this.todo_list_ui.appendChild(task_ui);
    }

    static clean_tasks_ui() {
        this.todo_list_ui.innerHTML = "";
    }

    // task ui handlers
    
    static remove_task_btn_handler(task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        this.todo.remove_task(task_id);
        task_ui.remove();
        this.load_tasks_ui();
    }

    static update_task_btn_handler(task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        let task_text_ui = task_ui.querySelector(".todo__text");
        task_text_ui.setAttribute("contenteditable", true);
        task_text_ui.focus();
    }

    static update_task_text_enter_handler(event, task_id) {
        if (event.keyCode == 13) {
            this.update_task_text_helper(task_id);
        }
    } 

    static check_btn_handler(task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        let state = task_ui.classList.contains("todo__task--active");
        task_ui.classList.toggle("todo__task--active");
        this.todo.tasks[task_id].state = !state;
        App.update_todo(this.todo.id, this.todo);
    }

    // helper functions

    static update_task_text_helper(task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        let task_text_ui = task_ui.querySelector(".todo__text");
        let text = task_text_ui.innerHTML.trim();
        text = (text != "") ? text : "Empty Task";
        this.todo.tasks[task_id].text = text;
        task_text_ui.setAttribute("contenteditable", false);
        task_text_ui.innerHTML = text;
        App.update_todo(this.todo.id, this.todo);
    }

    static refresh_position_helper() {
        let cards = this.get_all_cards_ui();
        let position = 0;
        cards.forEach((item) => {
            let id = item.id;
            this.todo.tasks[id].position = position;
            position++;
        });
        App.update_todo(this.todo.id, this.todo);
    }

    // task drag and drop

    static drag_start_task_handler(event, task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        // setTimeout(()=>{task_ui.classList.add("todo__task--draggable");}, 50);
        task_ui.classList.add("todo__task--draggable");
    }

    static drag_end_task_handler(event, task_id) {
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        task_ui.classList.remove("todo__task--draggable");
    }

    static drag_over_task_handler(event, task_id) {
        event.preventDefault();
        let dragged_task_ui = this.todo_list_ui.querySelector(".todo__task--draggable");
        let task_ui = this.todo_list_ui.querySelector(`#${task_id}`);
        let is_down = event.offsetY > (task_ui.getBoundingClientRect().height / 2);
        task_ui.insertAdjacentElement(is_down ? "afterend" : "beforebegin", dragged_task_ui);
        this.refresh_position_helper();
    }
}

UI.mainloop();