export default {
  api: {
    input: { target: './contracts/openapi.json' },
    output: {
      clean: true,
      target: './src/api/generated/client.ts',
      schemas: './src/api/generated/models',
      client: 'axios-functions',
      mode: 'single',
      override: { mutator: { path: './src/api/http.ts', name: 'apiHttp' } },
    },
  },
};
