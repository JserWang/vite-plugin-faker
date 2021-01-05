import type { Connect } from 'vite';
import { MockDataResolver } from '../resolver/mockData';
import type { MockData, Options } from '../types';
import { eventHub, logInfo, sleep } from '../utils';

let mockData: MockData[];
export const getOrGenerateMockData = async (opts: Options) => {
  const mockDataResolver = new MockDataResolver(opts);
  mockData = mockDataResolver.getOrGenerateData();
  return mockData;
};

eventHub.sub('UPDATE_MOCK_DATA', (data: MockData[]) => {
  mockData = data;
});

const getTargetMockData = (url: string | undefined) => mockData.filter((data) => data.url === url);

const isGet = (method: string | undefined) => method && method.toUpperCase() === 'GET';

export const requestMiddleware: Connect.NextHandleFunction = async (req, res, next) => {
  let url = isGet(req.method) ? req.url?.split('?')[0] : req.url;

  const targetMockData = getTargetMockData(url);
  if (targetMockData.length > 0) {
    logInfo(`invoke mock proxy: ${url}`);
    const data = targetMockData[0];
    if (data.timeout) {
      await sleep(data.timeout);
    }
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = data.httpCode ? data.httpCode : 200;
    res.end(JSON.stringify(data.response));
    return;
  }

  next();
};
