let user, tasksContainerUrl;

async function restoreSession() {
    try {
        await solidClientAuthentication.handleIncomingRedirect({ restorePreviousSession: true });

        const session = solidClientAuthentication.getDefaultSession();

        if (!session.info.isLoggedIn)
            return false;

        user = await fetchUserProfile(session.info.webId);

        return user;
    } catch (error) {
        alert(error.message);

        return false;
    }
}

function performLogin(loginUrl) {
    solidClientAuthentication.login({
        oidcIssuer: loginUrl,
        redirectUrl: window.location.href,
        clientName: 'Hello World',
    });
}

async function performLogout() {
    await solidClientAuthentication.logout();
}

async function performTaskCreation(description) {
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

    return { url: taskUrl, description };
}

async function performTaskUpdate(taskUrl, done) {
    const documentUrl = getSolidDocumentUrl(taskUrl);

    await updateSolidDocument(documentUrl, `
        DELETE DATA {
            <#it>
                <https://schema.org/actionStatus>
                <https://schema.org/${done ? 'PotentialActionStatus' : 'CompletedActionStatus'}> .
        } ;
        INSERT DATA {
            <#it>
                <https://schema.org/actionStatus>
                <https://schema.org/${done ? 'CompletedActionStatus' : 'PotentialActionStatus'}> .
        }
    `);
}

async function performTaskDeletion(taskUrl) {
    const documentUrl = getSolidDocumentUrl(taskUrl);

    await deleteSolidDocument(taskUrl);
}

async function loadTasks() {
    // TODO read from type index.
    const containerQuads = await readSolidDocument(`${user.storageUrl}tasks/`);

    if (!containerQuads)
        return [];

    tasksContainerUrl = `${user.storageUrl}tasks/`;

    const tasks = [];
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

            continue;
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

        tasks.push({
            url: taskUrl,
            description: descriptionQuad?.object.value || '-',
            done: statusQuad?.object.value === 'https://schema.org/CompletedActionStatus',
        });
    }

    return tasks;
}

async function readSolidDocument(url) {
    try {
        const response = await solidClientAuthentication.fetch(url, { headers: { Accept: 'text/turtle' } });

        if (!isSuccessfulStatusCode(response.status))
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

    if (!isSuccessfulStatusCode(response.status))
        throw new Error(`Failed creating document at ${url}, returned status ${response.status}`);

    return response.headers.get('Location');
}

async function updateSolidDocument(url, update) {
    const response = await solidClientAuthentication.fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: update,
    });

    if (!isSuccessfulStatusCode(response.status))
        throw new Error(`Failed updating document at ${url}, returned status ${response.status}`);
}

async function deleteSolidDocument(url) {
    const response = await solidClientAuthentication.fetch(url, { method: 'DELETE' });

    if (!isSuccessfulStatusCode(response.status))
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

    if (!isSuccessfulStatusCode(response.status))
        throw new Error(`Failed creating container at ${url}, returned status ${response.status}`);
}

function isSuccessfulStatusCode(statusCode) {
    return Math.floor(statusCode / 100) === 2;
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
