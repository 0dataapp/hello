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

async function restoreSession() {
    // wait for library ready event
    await init();

    try {
        if (!remoteStorage.remote.connected)
            return false;

        return {
            name: remoteStorage.remote.userAddress,
            url: remoteStorage.remote.userAddress,
        };
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
