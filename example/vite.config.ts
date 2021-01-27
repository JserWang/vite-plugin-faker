import { resolve } from 'path';
import { defineConfig } from 'vite';
import { vitePluginFaker } from 'vite-plugin-faker';

export default defineConfig({
  alias: [
    {
      find: '/@',
      replacement: resolve(__dirname, './src'),
    },
  ],
  plugins: [
    vitePluginFaker({
      basePath: '/src/apis',
      includes: [/^.*Service/],
      mockFile: true,
      watchFile: true,
    }),
  ],
});
