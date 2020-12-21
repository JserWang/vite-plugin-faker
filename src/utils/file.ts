import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'path';

/**
 * 目录不存在则创建
 * @param dir
 */
export const dirExistsOrCreate = (dir: string) => {
  const path = parse(dir).dir;
  if (!existsSync(path)) {
    mkdirSync(path);
  }
};

/**
 * 写文件
 * @param path
 * @param data
 */
export const writeFile = (path: string, data: string) => {
  dirExistsOrCreate(path);
  writeFileSync(path, data);
};

/**
 * 读取文件
 * @param path
 */
export const readFile = (path: string): string => {
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path).toString();
};
