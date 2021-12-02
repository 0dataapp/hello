# Glossary

The following is a list of basic concepts that you need to understand how Solid works. You can also check out the following presentation that introduces some of them: [RDF in SOLID](https://youtu.be/FEPabu0_3z0?t=967).

To learn more about Solid in general, visit https://solidproject.org.

- **Solid POD:** This is your personal storage where Solid applications store files.
- **Identity provider:** This is the service used to perform authentication, it is often served in the same url as your POD (but not always).
- **WebId:** The url that identifies you as a person, for example `https://noeldemartin.solidcommunity.net/profile/card#me`. WebIds can also identify organizations and other entities, it's not limited to individuals.
- **Solid document:** The data stored in your POD can either be a binary, like an image or video, or a document with semantic information (an RDF document). Although these are called documents, this doesn't mean that they are stored in a text file. Documents are represented by a url, and a Solid POD can persist them in any way (text files, database, etc.). As a developer, you don't care about the persistance format because you interact with those using the Solid protocol.
- **Solid container:** A collection of documents and binary resources. [Learn more](https://www.w3.org/TR/ldp-primer/).
- **Solid Profile:** This is the document that contains information about you. It is the document that contains your webId. For example `https://noeldemartin.solidcommunity.net/profile/card`.
- **RDF:** Resource Definition Framework, the abstract data representation language for data in Solid. [Learn more](https://www.w3.org/TR/rdf11-concepts/).
- **Turtle:** A specific RDF encoding format. [Learn more](https://www.w3.org/TR/turtle/).
- **SPARQL:** Query language used to query RDF data. [Learn more](https://www.w3.org/TR/sparql11-query/).
