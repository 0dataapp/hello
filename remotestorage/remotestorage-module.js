const todos = {
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

        cacheTodos: () => privateClient.cache(''),

        handle: privateClient.on,

        async addTask (description) {
          const id = Date.now().toString(36).toLowerCase();

          const item = {
            description,
          };
          
          await privateClient.storeObject('todo', id, item);

          return item;
        },

        async updateTask (id, completed) {
          // set `maxAge` to `false` to read from cache first
          const item = await privateClient.getObject(id, false);

          await privateClient.storeObject('todo', id, Object.assign(item, {
            completed,
          }));

          return item;
        },

        deleteTask: privateClient.remove.bind(privateClient),

      }
    }
  }
};
