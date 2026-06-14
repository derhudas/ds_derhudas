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