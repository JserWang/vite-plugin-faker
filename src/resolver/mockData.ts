import { existsSync } from 'fs';
import watch from 'node-watch';
import { compileClass, compileMockFile } from '../compiler';
import { MOCK_DIR, MOCK_FILE_NAME, ROOT } from '../constants';
import generateMockFile from '../generate/file';
import generateMockData from '../generate/mock';
import { MockData, Options } from '../types';
import eventHub from '../utils/eventHub';
import { logInfo } from '../utils/log';
import { getFilesFromPathByRule, joinPath } from '../utils/tool';

export class MockDataResolver {
  private filePath: string;
  private opts: Options;

  constructor(opts: Options) {
    this.filePath = joinPath(ROOT, opts.basePath, MOCK_DIR, MOCK_FILE_NAME);
    this.opts = opts;
    this.watchMockFile();
    this.watchRequestFile();
  }

  getMockData() {
    let mockData = this.getDataFromMockFile();
    if (mockData.length === 0) {
      mockData = this.getDataFromClassCompiler();
      this.generate(mockData);
      this.watchMockFile();
    }
    return mockData;
  }

  getDataFromMockFile() {
    return compileMockFile(this.filePath);
  }

  getDataFromClassCompiler() {
    const files = getFilesFromPathByRule('**/*.ts', joinPath(ROOT, this.opts.basePath));
    const compileResult = compileClass(files, this.opts);
    return generateMockData(compileResult);
  }

  generate(mockData: MockData[]) {
    this.opts.mockFile && generateMockFile(joinPath(ROOT, this.opts.basePath), mockData);
  }

  watchMockFile() {
    if (!existsSync(this.opts.basePath) || !this.opts.watchFile) {
      return;
    }
    watch(this.filePath, (event) => {
      if (event === 'update') {
        logInfo('The mock file changed, update the response mock data');
        const mockData = this.getDataFromMockFile();
        eventHub.pub('UPDATE_MOCK_DATA', mockData);
      }
    });
  }

  watchRequestFile() {
    if (!existsSync(this.opts.basePath) || !this.opts.watchFile) {
      return;
    }
    watch(
      joinPath(ROOT, this.opts.basePath),
      {
        recursive: true,
        // ignore mock.ts
        filter: (fileName) => {
          return fileName.indexOf(MOCK_FILE_NAME) === -1;
        },
      },
      (event) => {
        if (event === 'update') {
          logInfo('The request file changed, regenerate mock file');
          const mockData = this.getDataFromClassCompiler();
          this.generate(mockData);
        }
      }
    );
  }
}
