# Naming conventions

- Variables, functions, properties and module namespace aliases: camelCase (deviceId, parseJwt, onSuccess).
- Classes, interfaces, types, React components, Zod schema values and enum-like objects: PascalCase.
- Constants shared as fixed values: UPPER_SNAKE_CASE (DELETED_USER, POST_LIST_SIZE).
- Acronyms are words in owned identifiers: Id, Url, Jwt, Uuid, Bbs, Jsx; hashSha3 for the hash helper.
- Source and stylesheet filenames: kebab-case; React components and hooks keep their PascalCase/useCamelCase exports.
- Define URL parameters in src/routes.ts. Route modules use plain kebab-case filenames in src/routes/<domain>; do not encode URL parameters as [parameter] directories. Preserve third-party API names, environment variables and persisted storage keys.
- Generated code follows its generator's naming. Regenerate it from OpenAPI rather than renaming generated symbols manually.
- HTTP field names are camelCase. Rename contracts, handlers, consumers and generated clients together; document breaking wire-format changes.

## Imports and exports

- Import functions and components from their owning module with named imports. Avoid namespace-like default exports.
- Keep a small public barrel only when it presents a useful API, such as basics or chat-ui-react; list its exports explicitly.
- Files inside a module import sibling files directly, never their own barrel.
- Use import type / export type for type-only dependencies.
- Do not re-export unrelated feature state through API actions. Generated OpenAPI files retain generator-owned exports.

## Type declarations

- Use type for application-owned component props, store state and function inputs.
- Reserve the Props suffix for React component inputs; use State for store state.
- Keep interface when augmenting existing declarations, such as ImportMetaEnv.
- Generated OpenAPI code and externally sourced chat/topbar declarations retain their existing conventions.
