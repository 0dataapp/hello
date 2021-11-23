var Todos = {
  name: 'todos',
  builder: function(privateClient) {
    privateClient.declareType('todo', {
      type: 'object',
      properties: {
        description: { type: 'string' },
        done: { type: 'boolean' }
      },
      required: ['description']
    });

    return {
      exports: {

        init: function() {
          privateClient.cache('');
        },

        on: privateClient.on,

        async addTask (description) {
          const url = Date.now().toString(36).toLowerCase();
          const item = {
            url,
            description,
          };
          
          await privateClient.storeObject('todo', url, item);

          return item;
        },

        async updateTask (url, done) {
          // set `maxAge` to `false` to read from cache first
          const item = await privateClient.getObject(url, false);

          await privateClient.storeObject('todo', item.url, Object.assign(item, {
            done,
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
