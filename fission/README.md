# Fission Hello World

This is a simple application illustrating how to get started with [Fission](https://fission.codes).

It only has one dependency: the [webnative SDK](https://github.com/fission-suite/webnative). Everything else is plain HTML, CSS and JavaScript. All the functionality related with Fission is contained in a single file; `fission.js`.

## Documentation

You can find the documentation in the `fission.js` file, and some general Fission concepts in [the glossary](Glossary.md).

The `index.html` and `main.js` files are not documented, but they should be fairly easy to understand if you're already familiar with HTML and JavaScript. The application doesn't have any custom CSS as it is using a classless CSS framework called [Simple.css](https://simplecss.org).

## Usage instructions

If you want to play around with the application, you'll need to log into a [Fission account](https://auth.fission.codes).

If you want to modify the code, you'll also need to serve the application in a url. You could just open the `index.html` file in a browser, but unfortunately that will not work because the authentication flow performs a redirect and that won't work with a website being served with the `file://` protocol.

Any tool to run a local server will work, for example you could use [ViteJS](https://vitejs.dev/):

```sh
npm install -g vite
vite .
```
