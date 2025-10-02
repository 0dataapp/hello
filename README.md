# 0data Hello World

These are simple <a href="https://0data.app" target="_blank">Zero Data</a> apps demonstrating create/read/update/delete operations for <code>/todos</code> with only HTML, CSS, and JavaScript (minimal dependencies and no build systems).

https://hello.0data.app

Please consult the README for any protocol to learn more:

- [remoteStorage](remotestorage)
- [Solid](solid)
- [Fission](fission)

## Usage instructions

If you want to modify the code, you'll also need to serve the application in a url. You could just open the `index.html` file in a browser, but unfortunately that will not work because the authentication flow performs a redirect and that won't work with a website being served with the `file://` protocol.

Any tool to run a local server will work, for example you could use [ViteJS](https://vitejs.dev/):

```sh
npm install -g vite
vite .
```
