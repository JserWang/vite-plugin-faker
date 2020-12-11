import fs from 'fs';
import { MOCK_DIR, MOCK_FILE_NAME } from '../constants';
import { resolvePath } from './tool';

export const getMockData = (basePath: string) => {
  const mockFile = resolvePath(basePath, MOCK_DIR, MOCK_FILE_NAME);
  if (fs.existsSync(mockFile)) {
    return require(mockFile).default;
  }
  return [];
};
