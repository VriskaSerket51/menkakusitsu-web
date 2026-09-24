# Naming conventions

- Variables, functions, properties and module namespace aliases: camelCase (deviceId, parseJwt, onSuccess).
- Classes, interfaces, types, React components, Zod schema values and enum-like objects: PascalCase.
- Constants shared as fixed values: UPPER_SNAKE_CASE (DELETED_USER, POST_LIST_SIZE).
- Acronyms are words in owned identifiers: Id, Url, Jwt, Uuid, Bbs, Jsx; hashSha3 for the hash helper.
- Source and stylesheet filenames: kebab-case; React components and hooks keep their PascalCase/useCamelCase exports.
- Preserve framework routing names such as _app, _layout and [postId], third-party API names, environment variables and persisted storage keys.
- Generated code follows its generator's naming. Regenerate it from OpenAPI rather than renaming generated symbols manually.
- HTTP field names are camelCase. Rename contracts, handlers, consumers and generated clients together; document breaking wire-format changes.
