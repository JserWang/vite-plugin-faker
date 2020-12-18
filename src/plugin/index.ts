import type { ParameterizedContext } from 'koa';
import type { ServerPluginContext } from 'vite';
import { MockDataResolver } from '../resolver/mockData';
import type { MockData, Options } from '../types';
import eventHub from '../utils/eventHub';
import { logInfo } from '../utils/log';
import { sleep } from '../utils/tool';

let mockData: MockData[];
const getMockData = async (opts: Options) => {
  const mockDataResolver = new MockDataResolver(opts);
  mockData = mockDataResolver.getMockData();
  return mockData;
};

eventHub.sub('UPDATE_MOCK_DATA', (data: MockData[]) => {
  mockData = data;
});

const getTargetMockData = (url: string) => {
  return mockData.filter((data) => data.url === url);
};

const requestMiddleware = async (ctx: ParameterizedContext, next: any) => {
  const targetMockData = getTargetMockData(ctx.path);
  if (targetMockData.length > 0) {
    logInfo(`invoke mock proxy: ${ctx.path}`);
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
