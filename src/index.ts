import { Plugin } from 'vite';
import compile from './compile';
import { Options } from './types';

export const createMockServer = (opts: Options): Plugin => {
  const compileResult = compile(opts);
  console.log('result', JSON.stringify(compileResult, null, 2));
  return {};
};

// for test
createMockServer({
  basePath: '/playground',
  includes: [/^.*Service/],
  excludes: [],
});

export * from './types';
