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

    const dehydrate = function (object) {
      delete object.id;

      return object;
    };

    const hydrate = function (path, object) {
      object.completed = !!object.completed;

      return Object.assign(object, {
        id: path,
      });
    };

    return {
      exports: {
        hydrate,

        cacheTodos: () => privateClient.cache(''),

        handle: privateClient.on,

        async addTask (description) {
          const item = {
            description,
          };

          const id = new Date().toJSON().replace(/\D/g, '');
          
          await privateClient.storeObject('todo', id, item);

          return hydrate(id, item);
        },

        async updateTask (id, completed) {
          // set `maxAge` to `false` to read from cache first
          const item = await privateClient.getObject(id, false);

          await privateClient.storeObject('todo', id, dehydrate(Object.assign(item, {
            completed,
          })));

          return hydrate(id, item);
        },

        deleteTask: privateClient.remove.bind(privateClient),
      }
    }
  }
};
