const SUPABASE_URL = "GANTI_DENGAN_URL_SUPABASE";

const SUPABASE_KEY = "GANTI_DENGAN_PUBLISHABLE_KEY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function loadTasks() {

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("id");

    if (error) {

        document.body.innerHTML += `
            <pre>${JSON.stringify(error, null, 2)}</pre>
        `;

        return;
    }

    document.getElementById("total-count")
        .textContent = data.length;

    document.getElementById("todo-count")
        .textContent =
        data.filter(task =>
            task.status === "todo").length;

    document.getElementById("doing-count")
        .textContent =
        data.filter(task =>
            task.status === "doing").length;

    document.getElementById("done-count")
        .textContent =
        data.filter(task =>
            task.status === "done").length;

    const todoList =
        document.getElementById("todo-list");

    const doingList =
        document.getElementById("doing-list");

    const doneList =
        document.getElementById("done-list");

    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    data.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <strong>${task.title}</strong>

            <div class="priority ${task.priority}">
                ${task.priority.toUpperCase()}
            </div>
        `;

        if (task.status === "todo") {

            todoList.appendChild(card);

        } else if (task.status === "doing") {

            doingList.appendChild(card);

        } else if (task.status === "done") {

            doneList.appendChild(card);

        }

    });

}

loadTasks();