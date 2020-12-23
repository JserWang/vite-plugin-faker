import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'path';

/**
 * Create if the directory does not exist
 * @param dir
 */
export const dirExistsOrCreate = (dir: string) => {
  const path = parse(dir).dir;
  if (!existsSync(path)) {
    mkdirSync(path);
  }
};

export const writeFile = (path: string, data: string) => {
  dirExistsOrCreate(path);
  writeFileSync(path, data);
};

export const readFile = (path: string): string => {
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path).toString();
};

const formatJson = (data: any): string => JSON.stringify(data, null, 2);

export const createJsonFile = (path: string, data: any) => {
  writeFile(path, formatJson(data));
};
