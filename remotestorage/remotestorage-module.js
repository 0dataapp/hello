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

      }
    }
  }
};
