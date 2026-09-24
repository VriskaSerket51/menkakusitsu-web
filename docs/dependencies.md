# Dependency maintenance

- Runtime: Node.js 24.15 or newer; Node types follow the 24 major.
- React 19, MUI 9, React Router 7, Zustand 5 and Vite 8.
- TypeScript stays on 6.0.x while typescript-eslint requires TypeScript <6.1.
- ESLint uses eslint.config.mjs. Vite resolves tsconfig paths natively.
- Orval's @scalar/json-magic pins a vulnerable undici release. The scoped override uses patched undici 7.29 or newer within major 7. Remove it when the upstream dependency is fixed.
- tsParticles uses one stable ParticlesProvider initializer around the background layer.

Validation: npm run lint, npm test, npm run check:api, npm run build, npm run test:api-integration (sibling API build required; database double only).
