import chalk from 'chalk';
import { ParameterizedContext } from 'koa';
import type { ServerPluginContext } from 'vite';
import compile from '../compile';
import generateMockData from '../generate';
import generateMockFile from '../generate/file';
import type { MockData, Options } from '../types';
import { resolveMockData } from '../utils/mock';
import { joinPath, sleep } from '../utils/tool';

const root = process.cwd();

let mockData: MockData[];
const getMockData = async (opts: Options) => {
  const basePath = joinPath(root, opts.basePath);
  mockData = await resolveMockData(basePath);

  if (!mockData || (mockData && mockData.length === 0)) {
    const compileResult = compile(basePath, opts);
    // console.log(compileResult);
    mockData = generateMockData(compileResult);
    opts.mockFile && generateMockFile(basePath, mockData);
  }
  return mockData;
};

const getTargetMockData = (url: string) => mockData.filter((data) => data.url === url);

const requestMiddleware = async (ctx: ParameterizedContext, next: any) => {
  const targetMockData = getTargetMockData(ctx.path);
  if (targetMockData.length > 0) {
    console.log(`${chalk.redBright('[vite-plugin-faker] invoke:')} ${chalk.greenBright(ctx.path)}`);
    const data = targetMockData[0];
    if (data.timeout) {
      await sleep(data.timeout);
    }
    ctx.type = 'json';
    ctx.status = data.httpCode ? data.httpCode : 200;
    ctx.body = data.response;
    return;
  }
  await next();
};

export default (opts: Options) => ({ app }: ServerPluginContext) => {
  getMockData(opts);
  app.use(requestMiddleware);
};
