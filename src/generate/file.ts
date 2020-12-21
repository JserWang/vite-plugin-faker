import { MOCK_DIR, MOCK_FILE_NAME } from '../constants';
import { MockData } from '../types';
import { resolvePath, writeFile } from '../utils';

export const generateMockJson = (basePath: string, data: MockData[]) => {
  const path = resolvePath(basePath, MOCK_DIR, MOCK_FILE_NAME);
  writeFile(path, formatJson(data));
};

const formatJson = (data: any): string => JSON.stringify(data, null, 2);
