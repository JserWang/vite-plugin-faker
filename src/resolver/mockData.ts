import chalk from 'chalk';
import { existsSync } from 'fs';
import isEqual from 'lodash.isequal';
import watch from 'node-watch';
import { compileClass } from '../compiler';
import { ExpressionEntry } from '../compiler/expression';
import { MOCK_DATA_FILE, MOCK_DIR, MOCK_STRUCTURE_FILE, ROOT } from '../constants';
import { generateMockData } from '../generator/mock';
import { MockData, Options } from '../types';
import {
  createJsonFile,
  eventHub,
  getFilesFromPathByRule,
  joinPath,
  logInfo,
  readFile,
} from '../utils';

export class MockDataResolver {
  private mockFilePath: string;
  private mockStructurePath: string;
  private opts: Options;
  private originStructure: ExpressionEntry[];
  private originMockData: MockData[];

  constructor(opts: Options) {
    const mockDir = joinPath(ROOT, opts.basePath, MOCK_DIR);
    this.mockFilePath = joinPath(mockDir, MOCK_DATA_FILE);
    this.mockStructurePath = joinPath(mockDir, MOCK_STRUCTURE_FILE);
    this.opts = opts;

    this.originMockData = this.getDataFromMockFile();
    this.originStructure = this.getStructureFromJson();
    this.watchMockFile();
    this.watchRequestFile();
  }

  getMockData() {
    if (this.originMockData.length === 0) {
      const structure = this.getStructureFromFiles();
      const mockData = generateMockData(structure, new Map(), []);
      if (this.opts.mockFile) {
        this.createStructureFile(structure);
        this.createMockFile(mockData);

        this.watchMockFile();
        this.watchRequestFile();
      }
      this.originMockData = mockData;
    }

    return this.originMockData;
  }

  createMockFile(mockData: MockData[]) {
    logInfo('create mock json file');
    createJsonFile(this.mockFilePath, mockData);
  }

  createStructureFile(structure: ExpressionEntry[]) {
    logInfo('create structure json file');
    createJsonFile(this.mockStructurePath, structure);
  }

  getDataFromMockFile(): MockData[] {
    return JSON.parse(readFile(this.mockFilePath) || '[]');
  }

  /**
   * Get structure from specified file through ast
   */
  getStructureFromFiles(): ExpressionEntry[] {
    const files = getFilesFromPathByRule('**/*.ts', joinPath(ROOT, this.opts.basePath));
    const structure = compileClass(files, this.opts);
    // filter if item is null
    return structure.filter((item) => !!item) as ExpressionEntry[];
  }

  /**
   * Get the structure from structure.json
   */
  getStructureFromJson(): ExpressionEntry[] {
    return JSON.parse(readFile(this.mockStructurePath) || '[]');
  }

  watchMockFile() {
    if (!existsSync(this.mockFilePath) || !this.opts.watchFile) {
      return;
    }
    watch(this.mockFilePath, (event) => {
      if (event === 'update') {
        logInfo('Update the response mock data');
        const mockData = (this.originMockData = this.getDataFromMockFile());
        eventHub.pub('UPDATE_MOCK_DATA', mockData);
      }
    });
  }

  watchRequestFile() {
    const path = joinPath(ROOT, this.opts.basePath);
    if (!existsSync(path) || !this.opts.watchFile) {
      return;
    }
    watch(
      path,
      {
        recursive: true,
        // ignore mock data and mock structure files
        filter: (fileName) => {
          return (
            fileName.indexOf(MOCK_DATA_FILE) === -1 || fileName.indexOf(MOCK_STRUCTURE_FILE) === -1
          );
        },
      },
      (event) => {
        if (event === 'update') {
          const structure = this.getStructureFromFiles();
          const differences = this.getStructureDifferences(this.originStructure, structure);
          if (differences.length === 0) {
            return;
          }
          logInfo(
            `Different structures are monitored: '${chalk.red(
              differences.join(',')
            )}', regenerate mock file`
          );

          const mockData = generateMockData(
            structure,
            mockData2Map(this.originMockData),
            differences
          );

          this.originMockData = mockData;
          this.originStructure = structure;

          if (this.opts.mockFile) {
            this.createStructureFile(structure);
            this.createMockFile(mockData);
          } else {
            eventHub.pub('UPDATE_MOCK_DATA', mockData);
          }
        }
      }
    );
  }

  /**
   * Get the difference in two structures
   * @param originStructure
   * @param structure
   */
  getStructureDifferences(originStructure: ExpressionEntry[], structure: ExpressionEntry[]) {
    const originMap = expressionArray2Map(originStructure);
    const currentMap = expressionArray2Map(structure);

    const differences = new Array<string>();
    currentMap.forEach((value, key) => {
      if (originMap.has(key)) {
        if (!isEqual(originMap.get(key), currentMap.get(key))) {
          differences.push(key);
        }
      } else {
        // When it does not exist in the original structure, it is proved to be newly added and directly added
        differences.push(key);
      }
    });
    return differences;
  }
}

const expressionArray2Map = (expressions: ExpressionEntry[]) => {
  let result = new Map<string, Record<string, any>>();
  expressions.forEach((item) => {
    result.set(item.url, item.responseBody);
  });
  return result;
};

const mockData2Map = (list: MockData[]) => {
  const result = new Map<string, MockData>();
  list.forEach((item) => {
    result.set(item.url, item);
  });
  return result;
};
