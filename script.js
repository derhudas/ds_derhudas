const SUPABASE_URL = "https://cyevvhoessdlplpiiwdc.supabase.co";

const SUPABASE_KEY = "sb_publishable_M138Ywr1_yqE6B5i10yEZw_nUsCgwU1";

document.body.innerHTML += "<p>Mencoba terhubung...</p>";

async function testConnection() {
    try {
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        const { data, error } = await supabase
            .from("tasks")
            .select("*");

        if (error) {
            document.body.innerHTML += `
                <pre>Error:
${JSON.stringify(error, null, 2)}
                </pre>
            `;
            return;
        }
        
        const todoList = document.getElementById("todo-list");
    const doingList = document.getElementById("doing-list");
    const doneList = document.getElementById("done-list");

    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    data.forEach(task => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <strong>${task.title}</strong><br>
            Prioritas: ${task.priority}
        `;

        if (task.status === "todo") {
            todoList.appendChild(card);
        }
        else if (task.status === "doing") {
            doingList.appendChild(card);
        }
        else if (task.status === "done") {
            doneList.appendChild(card);
        }

    });

    } catch (err) {
        document.body.innerHTML += `
            <pre>Exception:
${err.message}
            </pre>
        `;
    }
}

testConnection();