// remoteStorage module
const remoteStorage = new RemoteStorage({
  modules: [todos],
  changeEvents: { local: true, window: true, remote: true, conflict: true },
});

remoteStorage.access.claim('todos', 'rw');

remoteStorage.todos.cacheTodos();

// remoteStorage events
remoteStorage.todos.handle('change', (event) => {
  if (event.newValue && !event.oldValue) {
    return appendTaskItem(remoteStorage.todos.hydrate(event.relativePath, event.newValue));
  }

  if (!event.newValue && event.oldValue) {
    return removeTaskObject(remoteStorage.todos.hydrate(event.relativePath, event.oldValue));
  }

  if (event.newValue && event.oldValue) {
  	removeTaskObject(event.oldValue)
  	return appendTaskItem(remoteStorage.todos.hydrate(event.relativePath, event.newValue));
  }
});

// setup after page loads
document.addEventListener('DOMContentLoaded', () => {
	if (window.self !== window.top) {
		remoteStorage.on('ready', () => {
		  document.querySelector('h1:first-of-type').remove();
		});
	}
});

// implement Hello API for `common/main.js`
function init() {
  // wrap ready event handler in promise
  return new Promise((res) => remoteStorage.on('ready', res));
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
	const url = prompt('What is your remoteStorage address?');

	if (!url)
		return null;

	return url;
}

function performLogin(storageAddress) {
	remoteStorage.connect(storageAddress);
}

function performLogout() {
	return remoteStorage.disconnect();
}

function performTaskCreation(description) {
	remoteStorage.todos.addTask(description);
	return null;
}

function performTaskUpdate(taskUrl, completed) {
	return remoteStorage.todos.updateTask(...arguments);
}

function performTaskDeletion(taskUrl) {
	return remoteStorage.todos.deleteTask(taskUrl);
}
