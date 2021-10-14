async function main() {
    const user = await restoreSession();

    if (!user)
        return;

    document.getElementById('username').innerText = user.name;
    document.body.classList.add('authenticated');

    const tasks = await loadTasks();

    for (const task of tasks) {
        appendTaskItem(task);
    }
}

function login() {
    const loginUrl = prompt('Introduce your Solid login url');

    if (!loginUrl)
        return;

    performLogin(loginUrl);
}

async function logout() {
    await performLogout();

    document.body.classList.remove('authenticated');
}

async function createTask() {
    const description = prompt('Task description');

    if (!description)
        return;

    const task = await performTaskCreation(description);

    appendTaskItem(task);
}

async function updateTask(taskUrl, done) {
    await performTaskUpdate(taskUrl, done);
}

async function deleteTask(taskUrl, taskElement) {
    await performTaskDeletion(taskUrl);

    taskElement.remove();
}

function appendTaskItem(task) {
    const taskItem = document.createElement('li');

    taskItem.innerHTML = `
        <input
            type="checkbox"
            ${task.done && 'checked'}
            onchange="updateTask('${task.url}', this.checked)"
        >
        <button
            type="button"
            onclick="deleteTask('${task.url}', this.parentElement)"
        >
            delete
        </button>
        ${task.description}
    `;

    document.getElementById('tasks').appendChild(taskItem);
}

// ------------------------------------------------------------------

main();

window.onunhandledrejection = (error) => alert(`Error: ${error.reason?.message}`);
