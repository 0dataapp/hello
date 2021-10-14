async function main() {
    const isLoggedIn = await restoreSession();

    if (!isLoggedIn)
        return;

    loadTasks();
}

// ---------------------------- APP ---------------------------------

function login() {
    const loginUrl = prompt('Introduce your Solid login url');

    if (!loginUrl)
        return;

    solidClientAuthentication.login({
        oidcIssuer: loginUrl,
        redirectUrl: window.location.href,
        clientName: 'Hello World',
    });
}

async function logout() {
    await solidClientAuthentication.logout();

    document.body.classList.remove('authenticated');
}

async function createTask() {
    const description = prompt('Task description');

    if (!description)
        return;

    if (!tasksContainerUrl) {
        await createSolidContainer(user.storageUrl, 'tasks');

        // TODO register in type index.

        tasksContainerUrl = `${user.storageUrl}tasks/`;
    }

    // TODO escape description string.
    const documentUrl = await createSolidDocument(tasksContainerUrl, `
        @prefix schema: <https://schema.org/> .

        <#it>
            a schema:Action ;
            schema:actionStatus schema:PotentialActionStatus ;
            schema:description "${description}" .
    `);
    const taskUrl = `${documentUrl}#it`;

    appendTaskItem({ url: taskUrl, description });
}

async function updateTask(taskUrl, complete) {
    const documentUrl = getSolidDocumentUrl(taskUrl);

    await updateSolidDocument(documentUrl, `
        DELETE DATA {
            <#it>
                <https://schema.org/actionStatus>
                <https://schema.org/${complete ? 'PotentialActionStatus' : 'CompletedActionStatus'}> .
        } ;
        INSERT DATA {
            <#it>
                <https://schema.org/actionStatus>
                <https://schema.org/${complete ? 'CompletedActionStatus' : 'PotentialActionStatus'}> .
        }
    `);
}

async function deleteTask(taskUrl, taskElement) {
    const documentUrl = getSolidDocumentUrl(taskUrl);

    await deleteSolidDocument(taskUrl);

    taskElement.remove();
}

// ------------------------- INTERNAL -------------------------------
let user, tasksContainerUrl;

async function readSolidDocument(url) {
    try {
        const response = await solidClientAuthentication.fetch(url, { headers: { Accept: 'text/turtle' } });

        if (response.status !== 200)
            return null;

        const data = await response.text();
        const parser = new N3.Parser({ baseIRI: url });

        return parser.parse(data);
    } catch (error) {
        return null;
    }
}

async function createSolidDocument(url, contents) {
    const response = await solidClientAuthentication.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/turtle' },
        body: contents,
    });

    if (response.status !== 201)
        throw new Error(`Failed creating document at ${url}, returned status ${response.status}`);

    return response.headers.get('Location');
}

async function updateSolidDocument(url, update) {
    const response = await solidClientAuthentication.fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: update,
    });

    if (response.status !== 205)
        throw new Error(`Failed updating document at ${url}, returned status ${response.status}`);
}

async function deleteSolidDocument(url) {
    const response = await solidClientAuthentication.fetch(url, { method: 'DELETE' });

    if (response.status !== 205)
        throw new Error(`Failed deleting document at ${url}, returned status ${response.status}`);
}

async function createSolidContainer(url, name) {
    const response = await solidClientAuthentication.fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/turtle',
            'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
            'Slug': name,
        },
    });

    if (response.status !== 201)
        throw new Error(`Failed creating container at ${url}, returned status ${response.status}`);
}

function getSolidDocumentUrl(resourceUrl) {
    const url = new URL(resourceUrl);

    url.hash = '';

    return url.href;
}

async function fetchUserProfile(webId) {
    const profileQuads = await readSolidDocument(webId);
    const nameQuad = profileQuads.find(quad => quad.predicate.value === 'http://xmlns.com/foaf/0.1/name');
    const storageQuad = profileQuads.find(quad => quad.predicate.value === 'http://www.w3.org/ns/pim/space#storage');

    return {
        name: nameQuad?.object.value || 'Anonymous',
        storageUrl: storageQuad?.object.value || await findUserStorage(webId),
    };
}

async function findUserStorage(url) {
    url = url.replace(/#.*$/, '');
    url = url.endsWith('/') ? url + '../' : url + '/../';
    url = new URL(url);

    const response = await solidClientAuthentication.fetch(url.href);

    if (response.headers.get('Link')?.includes('<http://www.w3.org/ns/pim/space#Storage>; rel="type"'))
        return url.href;

    if (url.pathname === '/')
        return url.href;

    return findUserStorage(url.href)
}

async function restoreSession() {
    await solidClientAuthentication.handleIncomingRedirect({ restorePreviousSession: true });

    const session = solidClientAuthentication.getDefaultSession();

    if (!session.info.isLoggedIn)
        return false;

    user = await fetchUserProfile(session.info.webId);

    document.getElementById('username').innerText = user.name;
    document.body.classList.add('authenticated');

    return true;
}

async function loadTasks() {
    // TODO read from type index.
    const containerQuads = await readSolidDocument(`${user.storageUrl}tasks/`);

    if (!containerQuads)
        return;

    tasksContainerUrl = `${user.storageUrl}tasks/`;

    const containmentQuads = containerQuads.filter(quad => quad.predicate.value === 'http://www.w3.org/ns/ldp#contains');

    for (const containmentQuad of containmentQuads) {
        const documentQuads = await readSolidDocument(containmentQuad.object.value);
        const typeQuad = documentQuads.find(
            quad =>
                quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                quad.object.value === 'https://schema.org/Action'
        );

        if (!typeQuad) {
            // Not a Task, we can ignore this document.

            return;
        }

        const taskUrl = typeQuad.subject.value;
        const descriptionQuad = documentQuads.find(
            quad =>
                quad.subject.value === taskUrl &&
                quad.predicate.value === 'https://schema.org/description'
        );
        const statusQuad = documentQuads.find(
            quad =>
                quad.subject.value === taskUrl &&
                quad.predicate.value === 'https://schema.org/actionStatus'
        );

        appendTaskItem({
            url: taskUrl,
            description: descriptionQuad?.object.value || '-',
            completed: statusQuad?.object.value === 'https://schema.org/CompletedActionStatus',
        });
    }
}

function appendTaskItem(task) {
    const taskItem = document.createElement('li');

    taskItem.innerHTML = `
        <input
            type="checkbox"
            ${task.completed && 'checked'}
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
