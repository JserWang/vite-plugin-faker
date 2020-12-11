import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import esbuildPlugin from 'rollup-plugin-esbuild';
import { MOCK_DIR, MOCK_FILE_NAME } from '../constants';
import { MockData } from '../types';
import { resolvePath } from './tool';

export const resolveMockData = async (basePath: string) => {
  const mockFile = resolvePath(basePath, MOCK_DIR, MOCK_FILE_NAME);
  if (fs.existsSync(mockFile)) {
    const mockData = await resolveModule(mockFile);
    return mockData;
  }
  return [];
};

const supportedExts = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'];

/**
 * from vite src/node/config.ts
 * @param path
 */
const resolveModule = async (path: string) => {
  const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve({
    extensions: supportedExts,
  });

  const bundle = await rollup({
    input: path,
    treeshake: false,
    plugins: [
      esbuildPlugin({
        include: /\.[jt]sx?$/,
        exclude: /node_modules/,
        sourceMap: false,
      }),
      nodeResolve,
    ],
  });

  const {
    output: [{ code }],
  } = await bundle.generate({
    exports: 'named',
    format: 'cjs',
  });
  const resolved = await loadMockDataFromBundledFile(path, code);
  return resolved;
};

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any;
}

const loadMockDataFromBundledFile = (
  fileName: string,
  bundledCode: string
): Promise<MockData[]> => {
  const extension = path.extname(fileName);
  const defaultLoader = require.extensions[extension]!;
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  delete require.cache[fileName];
  const raw = require(fileName);
  const result = raw.__esModule ? raw.default : raw;
  require.extensions[extension] = defaultLoader;
  return result;
};
