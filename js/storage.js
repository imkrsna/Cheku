// data classes

export class Utility {
    static gen_str_id() {
        let random_id = `${Math.floor(Math.random() * 10)}${Date.now()}`;
        let str_id = "ID";
        [...random_id].forEach((item) => {
            let flag = (Math.floor(Math.random() * 10) >= 6) ? 48 : 65;
            str_id += String.fromCharCode(flag + Number(item));
        });
        return str_id;
    }

    static get_url_id(key) {
        let url = new URL(window.location.href);
        let para = url.searchParams;

        let id = para.get(key) || null;
        return id;
    }
}

export class API {
    static url = "https://jsonblob.com/api/jsonBlob";

    static upload_todo(todo_id) {
        let todo = App.ls_fetch()[todo_id] || null;
        if (todo != null) {
            fetch(this.url, {
                "method": "POST",
                "headers": {'Content-Type': 'application/json'},
                "body": JSON.stringify(todo)
            }).then(response => {
                if (!response.ok) {
                    console.log(`Error has been occured:${response.status}`);
                }
                return response.headers.get("location");
            }).then(data => {
                this.copy_share_url(data);
            }).catch(error => {
                throw error;
            });
        }
    }

    static download_todo(share_id) {
        let todo = null;
        fetch(`${this.url}/${share_id}`, {
            "method": "GET",
            "headers": {'Content-Type': 'application/json'},
        }).then(response => {
            if (!response.ok) {
                console.log(`Error has been occured:${response.status}`);
            }
            return response.json();
        }).then(data => {
            todo = new Todo().assign(data);
            App.update_todo(todo.id, todo);
            window.location.href = "/";
        }).catch(error => {
            throw error;
        });
    }

    static copy_share_url(base_url) {
        let parts = base_url.split("/");
        let last_part = parts[parts.length - 1];
        let url = `${window.location.hostname}/save.html?share=${last_part}`;
        navigator.clipboard.writeText(url);
        alert(`share link copied!\n${url}`);
    } 
}

export class App {
    static todos = {}

    static ls_fetch() {
        let data_str = localStorage.getItem("all_todos");
        this.todos = JSON.parse(data_str) || {};
        return this.todos;
    }

    static ls_update() {
        let data_str = JSON.stringify(this.todos);
        localStorage.setItem("all_todos", data_str);
    }

    static update_todo(todo_id, todo) {
        this.todos[todo_id] = todo;
        this.ls_update();
    }

    static remove_todo(todo_id) {
        delete this.todos[todo_id];
        this.ls_update();
    }

    static create_todo(title) {
        let todo = new Todo(title);
        this.todos[todo.id] = todo;
        this.ls_update();
        return this.todos[todo.id];
    }
}

export class Task {
    constructor(text, state, position) {
        this.id = Utility.gen_str_id();
        this.text = text;
        this.state = state;
        this.position = position;
    }

    assign(obj) {
        Object.assign(this, obj);
        return this;
    }
}

export class Todo {
    constructor(title = "Untitled") {
        this.id = Utility.gen_str_id();
        this.title = title;
        this.tasks = {};
    }

    assign(obj) {
        Object.assign(this, obj);
        return this;
    }

    add_task(text, state, position) {
        let task = new Task(text, state, position);
        this.tasks[task.id] = task;
        App.update_todo(this.id, this);
        return task;
    }

    update_task(task_id, text, state, position) {
        this.tasks[task_id].text = text;
        this.tasks[task_id].state = state;
        this.tasks[task_id].position = position;
        App.update_todo(this.id, this);
    }

    remove_task(task_id) {
        delete this.tasks[task_id];
        App.update_todo(this.id, this);
    }
}