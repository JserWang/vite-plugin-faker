import { ParameterizedContext } from 'koa';
import type { ServerPluginContext } from 'vite';
import type { MockData, Options } from '../types';
import { sleep } from '../utils/tool';

const getTargetMockData = (mockData: MockData[], path: string) =>
  mockData.filter((data) => data.url === path);

const requestMiddleware = (opts: Options, mockData: MockData[]) => async (
  ctx: ParameterizedContext,
  next: any
) => {
  const targetMockData = getTargetMockData(mockData, ctx.path);
  if (targetMockData.length > 0) {
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

export default (opts: Options, mockData: MockData[]) => ({ app }: ServerPluginContext) => {
  app.use(requestMiddleware(opts, mockData));
};
