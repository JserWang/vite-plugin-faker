import { Plugin } from 'vite';
import compile from './compile';
import generateMockData from './generate';
import createServerPlugin from './plugin';
import { Options } from './types';

export const createMockServer = (opts: Options): Plugin => {
  const compileResult = compile(opts);
  const mockData = generateMockData(compileResult);

  return {
    configureServer: createServerPlugin(opts, mockData),
  };
};

export * from './types';
