// imports
import {App, Task, Todo, Utility, API} from "./storage.js";

class UI {
    // ui elements
    static _404 = document.getElementById("_404");

    // logic variables
    static share_id = Utility.get_url_id("share");

    // ui functions
    static mainloop() {
        this.import_todo();
    }

    static import_todo() {
        if (this.share_id != null) {
            API.download_todo(this.share_id);
        }
    }
}
UI.mainloop();