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
