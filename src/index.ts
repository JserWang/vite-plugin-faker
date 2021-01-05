import { Plugin, ResolvedConfig } from 'vite';
import { getOrGenerateMockData, requestMiddleware } from './plugin';
import { Options } from './types';

export const vitePluginFaker = (opts: Options): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'vite-faker',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer({ app }) {
      // serve: plugin only invoked by dev server
      if (config.command !== 'serve') {
        return;
      }
      getOrGenerateMockData(opts);

      app.use(requestMiddleware);
    },
  };
};

export * from './types';
