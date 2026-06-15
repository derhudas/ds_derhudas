const SUPABASE_URL = "https://cyevvhoessdlplpiiwdc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_M138Ywr1_yqE6B5i10yEZw_nUsCgwU1";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function testConnection() {

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .limit(5);

    if (error) {
        console.error("Error:", error);
        alert("Gagal mengambil data.");
        return;
    }

    console.log(data);

    alert(
        `Berhasil mengambil ${data.length} tugas dari Supabase!`
    );
}

testConnection();

function addTask(button) {
    const column = button.parentElement;

    const input = column.querySelector(".task-input");

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    const card = document.createElement("div");

    card.className = "card";

    card.textContent = text;

    input.before(card);

    input.value = "";
}