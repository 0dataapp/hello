const remoteStorage = new RemoteStorage({
  modules: [
      Todos,
  ],
});

async function init() {
  remoteStorage.access.claim('todos', 'rw');

  // // mount the optional Connect widget
  // var widget = new Widget(remoteStorage);
  // widget.attach();

  remoteStorage.todos.init();

  // // handle change events
  // remoteStorage.todos.on('change', function(event) {
  //   if(event.newValue && (! event.oldValue)) {
  //     console.log('Change from '+event.origin+' (add)', event);
  //   }
  //   else if((! event.newValue) && event.oldValue) {
  //     console.log('Change from '+event.origin+' (remove)', event);
  //   }
  //   else if(event.newValue && event.oldValue) {
  //     console.log('Change from '+event.origin+' (change)', event);
  //   }
  // });

  // wrap ready event handler in promise
  return new Promise(function (res) {
    remoteStorage.on('ready', function() {
        return res();
    }); 
  });

}

// You can find the basic Solid concepts explained in the Glossary.md file, inline comments talk about
// the specifics of how this application is implemented.

let user, tasksContainerUrl;

async function restoreSession() {
    // wait for library ready event
    await init();

    try {
        if (!remoteStorage.remote.connected)
            return false;

        user = {
            name: remoteStorage.remote.userAddress,
            url: remoteStorage.remote.userAddress,
        };

        return user;
    } catch (error) {
        alert(error.message);

        return false;
    }
}

function getLoginUrl() {
    const url = prompt('Introduce your remoteStorage address');

    if (!url)
        return null;

    return url;
}

function performLogin(storageAddress) {
    remoteStorage.connect(storageAddress);
}

async function performLogout() {
    return remoteStorage.disconnect();
}

async function performTaskCreation(description) {
    return await remoteStorage.todos.addTask(description);
}

async function performTaskUpdate(taskUrl, done) {
    await remoteStorage.todos.updateTask(...arguments);
}

async function performTaskDeletion(taskUrl) {
    await remoteStorage.todos.deleteTask(taskUrl);
}

async function loadTasks() {
    return Object.values(await remoteStorage.todos.listTasks());
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
