# vite-plugin-faker

## Usage

1. installation

```bash
yarn add -D vite-plugin-faker
```

2. configuration

in `vite-config-ts`

```typescript
import { vitePluginFaker } from 'vite-plugin-faker';

plugin: {
  vitePluginFaker({
    basePath: 'src/apis',
    includes: [/^.*Service/],
    excludes: [],
    watchFile: true,
    mockFile: true,
  });
}
```

## Advanced

### mockFile

If `mockFile` is `true`, the plugin will generate mock file to `basePath`.If the mock file is exists, plugin will always get mock data from this.

If `mockFile` is `false`, the plugin will compile the `includes` files to mock data at runtime.

### watchFile

If `watchFile` is `true`, the plugin will watch the specified files, when they change, the mock file and mock data will be updated automatically.
