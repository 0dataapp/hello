let publicLink = null;
let username, goToLobby, wnfs;

async function init() {
    // we work with the webnative library through the `state` variable returned from this function
    await webnative.initialize({
        permissions: {
            // there is also an alternate 'Apps' directory for which you can claim permission, see https://guide.fission.codes/developers/webnative/auth
            fs: {
                private: [webnative.path.directory('todos')]
            }
        }
    }).then(async state => {
        switch (state.scenario) {
            case webnative.Scenario.AuthSucceeded:
            case webnative.Scenario.Continuation:
                // authorized
                username = state.username;
                wnfs = state.fs;

                break;

            case webnative.Scenario.NotAuthorised:
            case webnative.Scenario.AuthCancelled:
                // not authorized
                goToLobby = function () {
                    webnative.redirectToLobby(state.permissions);
                };

                break;
            }
    }).catch(error => {
        switch (error) {
            // private mode and non-localhost:3000 may cause issues
            case webnative.InitialisationError.UnsupportedBrowser:
                window.alert('Unsupported browser.')
                break;

            case webnative.InitialisationError.InsecureContext:
                window.alert('Insecure context.')
                break;
            }
    })
}

// You can find the basic Solid concepts explained in the Glossary.md file, inline comments talk about
// the specifics of how this application is implemented.

let user, tasksContainerUrl;

async function restoreSession() {
    // wait for library ready event
    await init();

    try {
        if (!username)
            return false;

        return {
            name: username,
            url: username,
        };
    } catch (error) {
        alert(error.message);

        return false;
    }
}

function getLoginUrl() {
    return 'TO_BE_DETERMINED';
}

function performLogin(loginUrl) {
    goToLobby();
}

async function performLogout() {
    await webnative.leave({
        withoutRedirect: true,
    });
}

async function performTaskCreation(description) {
    const url = Date.now().toString(36).toLowerCase();
    const item = {
        url,
        description,
    };

    await wnfs.write(webnative.path.file('private', 'todos', url), JSON.stringify(item));
    await wnfs.publish();

    return item;
}

async function performTaskUpdate(taskUrl, done) {
    const item = JSON.parse(await wnfs.cat(webnative.path.file('private', 'todos', taskUrl)));

    await wnfs.write(webnative.path.file('private', 'todos', item.url), JSON.stringify(Object.assign(item, {
      done,
    })));
    await wnfs.publish();

    return item;
}

async function performTaskDeletion(taskUrl) {
    await wnfs.rm(webnative.path.file('private', 'todos', taskUrl))
    await wnfs.publish();
}

async function loadTasks() {
    return (await Promise.all(Object.keys(await wnfs.ls(webnative.path.directory('private', 'todos'))).map(function (e) {
      return wnfs.cat(webnative.path.file('private', 'todos', e));
    }))).map(JSON.parse);
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

    const location = response.headers.get('Location');

    return new URL(location, url).href;
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
        url: webId,
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

function escapeText(text) {
    return text.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
