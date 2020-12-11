# vite-plugin-faker

## Usage

1. installation

```bash
yarn add vite-plugin-faker
```

2. configuration

in `vite-config-ts`

```typescript
import { createMockServer } from 'vite-plugin-faker';

plugin: {
  createMockServer({
    basePath: 'src/apis',
    includes: [/^.*Service/],
    excludes: [],
  });
}
```

## Advanced

### mockFile

If `mockFile` is `true`, the plugin will generate mock file to `basePath`.If the mock file is exists, plugin will always get mock data from this.

If `mockFile` is `false`, the plugin will compile the `includes` files to mock data at runtime.

## TODO

[x] Generate mock file

[x] Load mock data from mock file

[] Compare mock file with compile result and regenerate new mock file

[] Watch the includes file change and recompile mock data

[] Watch the mock file change
