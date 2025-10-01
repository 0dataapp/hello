var todos = {
  name: 'todos',
  builder: function(privateClient) {
    privateClient.declareType('todo', {
      type: 'object',
      properties: {
        description: { type: 'string' },
        completed: { type: 'boolean' },
      },
      required: ['description'],
    });

    return {
      exports: {

        init: function() {
          privateClient.cache('');
        },

        on: privateClient.on,

        async addTask (description) {
          const id = Date.now().toString(36).toLowerCase();
          const item = {
            id,
            description,
          };
          
          await privateClient.storeObject('todo', id, item);

          return item;
        },

        async updateTask (id, completed) {
          debugger
          // set `maxAge` to `false` to read from cache first
          const item = await privateClient.getObject(id, false);

          await privateClient.storeObject('todo', id, Object.assign(item, {
            completed,
          }));

          return item;
        },

        deleteTask: privateClient.remove.bind(privateClient),

        listTasks: function() {
          return privateClient.getAll('');
        }
      }
    }
  }
};
