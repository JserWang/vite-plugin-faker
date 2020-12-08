import { Plugin } from 'vite';
import compile from './compile';

const install = (opts: Options): Plugin => {
  const compileResult = compile(opts);
  console.log('result', JSON.stringify(compileResult, null, 2));
  return {};
};

install({
  basePath: '/playground',
  includes: [/^.*Service/],
  excludes: [],
});
