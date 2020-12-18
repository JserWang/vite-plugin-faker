import { Plugin } from 'vite';
import createServerPlugin from './plugin';
import { Options } from './types';

export const vitePluginFaker = (opts: Options): Plugin => {
  return {
    configureServer: createServerPlugin(opts),
  };
};

export * from './types';
