import { MockDataResolver } from '../src/resolver/mockData';

const mockDataResolver = new MockDataResolver({
  basePath: '/playground',
  includes: [/^.*Service/],
  mockFile: true,
  watchFile: true,
});

mockDataResolver.getOrGenerateData();
