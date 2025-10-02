async function main() {
    const user = await restoreSession();

    document.getElementById('loading').setAttribute('hidden', '');

    if (!user) {
        document.getElementById('auth-guest').removeAttribute('hidden');

        return;
    }

    document.getElementById('username').innerHTML = `<a href="${user.url}" target="_blank">${user.name}</a>`;
    document.getElementById('auth-user').removeAttribute('hidden');
}

function login() {
    const loginUrl = getLoginUrl();

    if (!loginUrl)
        return;

    performLogin(loginUrl);
}

async function logout() {
    document.getElementById('logout-button').setAttribute('disabled', '');

    await performLogout();

    document.getElementById('auth-guest').removeAttribute('hidden');
    document.getElementById('auth-user').setAttribute('hidden', '');
    document.getElementById('logout-button').removeAttribute('disabled');
}

async function createTask() {
    const description = prompt('Task description');

    if (!description)
        return;

    const task = await performTaskCreation(description);

    appendTaskItem(task);
}

async function updateTask(taskUrl, button) {
    const completed = button.innerText === 'Complete';
    button.setAttribute('disabled', '');

    await performTaskUpdate(taskUrl, completed);

    button.removeAttribute('disabled');
    button.innerText = completed ? 'Undo' : 'Complete';
}

async function deleteTask(taskUrl, taskElement, button) {
    button.setAttribute('disabled', '');

    await performTaskDeletion(taskUrl);

    taskElement.remove();
}

function removeTaskObject(task) {
    document.querySelector(`li[data-id="${ task.id }"]`).remove();
}

function appendTaskItem(task) {
    const taskItem = document.createElement('li');

    taskItem.dataset.id = task.id;

    taskItem.innerHTML = `
        <button
            type="button"
            onclick="deleteTask('${task.id}', this.parentElement, this)"
        >
            Delete
        </button>
        <button
            type="button"
            onclick="updateTask('${task.id}', this)"
            style="width:100px"
        >
            ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <span>${task.description}</span>
    `;

    document.getElementById('tasks').appendChild(taskItem);
}

// ------------------------------------------------------------------

main();

window.onunhandledrejection = (error) => alert(`Error: ${error.reason?.message}`);
