# Solid Hello World

This is a simple application illustrating how to get started with [Solid](https://solidproject.org/).

It only has two dependencies: [an authentication library](https://github.com/inrupt/solid-client-authn-js) and [an RDF parsing library](https://github.com/rdfjs/N3.js). Everything else is plain HTML, CSS and JavaScript. All the functionality related with Solid is contained in a single file; `solid.js`.

## Instructions

If you want to play around with the application, you'll need to log into a [Solid POD](https://solidproject.org/users/get-a-pod).

To run one in your local environment, we suggest that you use the [Community Solid Server (CSS)](https://github.com/solid/community-server) with the filesystem configuration. This will use your filesystem to serve a Solid POD from the folder of your choice; `./solid-pod` in this case:

```sh
npm install -g @solid/community-server
community-solid-server -c @css:config/file.json -p 4000 -f ./solid-pod
```

If you want to modify the code, you'll also need to serve the application in a url. You could just open the `index.html` file in a browser, but unfortunately that will not work because the authentication flow performs a redirect and that won't work with a website being served with the `file://` protocol.

Any tool to run a local server will work, for example you could use [ViteJS](https://vitejs.dev/):

```sh
npm install -g vite
vite .
```
