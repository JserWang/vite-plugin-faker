import { Plugin } from 'vite';
import compile from './compile';
import generateMockData from './generate';
import generateMockFile from './generate/file';
import createServerPlugin from './plugin';
import { Options } from './types';
import { getMockData } from './utils/mock';
import { joinPath } from './utils/tool';

const root = process.cwd();

export const createMockServer = (opts: Options): Plugin => {
  const basePath = joinPath(root, opts.basePath);
  let mockData = getMockData(basePath);

  if (!mockData) {
    const compileResult = compile(basePath, opts);
    mockData = generateMockData(compileResult);
    opts.mockFile && generateMockFile(basePath, mockData);
  }

  return {
    configureServer: createServerPlugin(opts, mockData),
  };
};

export * from './types';
