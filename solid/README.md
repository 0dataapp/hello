# Solid Hello World

This folder contains some simple applications illustrating how to get started with [Solid](https://solidproject.org/) using different libraries.

- [solid-file-client](./solid-file-client): This example uses a higher-level library called [solid-file-client](https://github.com/jeff-zucker/solid-file-client). It's pretty minimal library, but makes some basic operations easier.
- [solid-rest-api](./solid-rest-api): This example is the most minimal, it only uses the authentication library and a Turtle parser. All the interaction with the POD is implemented using the native `fetch` function.

## Understanding the code

If you're not familiar with the basics of Solid, we strongly suggest that you check out [the glossary](Glossary.md). You can find more documentation about each code sample in the source files, they contain inline comments specific to each implementation.

The `index.html` and `main.js` files are not documented, but they should be fairly easy to understand if you're already familiar with HTML and JavaScript. The application doesn't have any custom CSS because it uses a classless CSS framework called [Simple.css](https://simplecss.org).

## Usage instructions

If you want to play around with the application, you'll need to log into a [Solid POD](https://solidproject.org/users/get-a-pod). If you prefer to run one in your local environment, we suggest that you use the [Community Solid Server (CSS)](https://github.com/solid/community-server) with the filesystem configuration. This will use your filesystem to serve a Solid POD from the folder of your choice; `./solid-pod` in this case:

```sh
npm install -g @solid/community-server
community-solid-server -c @css:config/file-no-setup.json -p 4000 -f ./solid-pod
```

If you want to modify the code, you'll also need to serve the application in a url. You could just open the `index.html` file in a browser, but unfortunately that will not work because the authentication flow performs a redirect and that won't work with a website being served with the `file://` protocol.

Any tool to run a local server will work, for example you could use [ViteJS](https://vitejs.dev/):

```sh
npm install -g vite
vite .
```

## FAQs

### Why is this example using Turtle, and not something more developer-friendly like [JSON-LD](https://json-ld.org/)?

The app could have been built using other RDF formats, but Turtle is the most common in practice and you're likely to find it anyways when looking at other resources. This app is simple enough that the Turtle it's using is easy to understand, so it can also serve as a light introduction to Turtle itself.

### Why is this app writing Turtle by hand? Aren't there libraries to do that?

Yes! We don't actually recommend using this approach in a real application, but it is a good way to understand how Solid works. In the same way that you wouldn't normally write SQL statements by hand, but it's useful to learn SQL before using libraries.

Also, one of the best ways to debug a Solid application, regardless of what libraries it's using, is opening the network tab and looking at the request payloads. If you want to understand that, you'll need to understand Turtle and how the requests are typically made.

If you want to use a more advanced library, check out this list of [Solid Developer Tools & Libraries](https://solidproject.org/developers/tools).

### This example is too simple, can you make one using more libraries?

There are already some existing examples using more libraries:

- [Solid To-Do App Tutorial](https://www.virginiabalseiro.com/blog/tutorial) ([React](https://reactjs.org/) + [solid-client](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-data/)): A tutorial of how to build a To-Do app using [Inrupt](https://inrupt.com/)'s libraries.
- [Ramen](https://github.com/noeldemartin/ramen) ([Vue](https://vuejs.org/) + [soukai-solid](https://github.com/noeldemartin/soukai-solid)): A simple application that adds a recipe for Ramen to your POD. This application can also serve as an example to use the type index.
- [Hello Solid](https://wkokgit.github.io/hellosolid/) ([JQuery](https://jquery.com/) + [rdflib](https://github.com/linkeddata/rdflib.js)/[LDFlex](https://github.com/LDflex/LDflex)): A Solid Client application to explain the basics of Solid. Keep in mind that this library uses the deprecated [solid-auth-client](https://github.com/solid/solid-auth-client) for authentication, and will not work with newer Solid PODs.

You can also check out [this list](https://timea.solidcommunity.net/HelloWorld/index.html).
