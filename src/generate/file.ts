import fs from 'fs';
import { MOCK_DIR, MOCK_FILE_NAME } from '../constants';
import { MockData } from '../types';
import { resolvePath } from '../utils/tool';

const getTemplate = (mockData: MockData[]) => `
import { MockData } from 'vite-plugin-faker';

export default ${JSON.stringify(mockData, null, 2)} as MockData[];
`;

export default (path: string, mockData: MockData[]) => {
  const mockDir = resolvePath(path, MOCK_DIR);
  const mockFile = resolvePath(mockDir, MOCK_FILE_NAME);
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir);
  }
  if (!fs.existsSync(mockFile)) {
    fs.writeFileSync(mockFile, getTemplate(mockData));
  } else {
    // TODO: compare exists file and regenerate differences
  }
};
