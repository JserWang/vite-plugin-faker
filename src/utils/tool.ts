import { glob } from 'glob';
import { join, resolve } from 'path';

export const joinPath = (...path: string[]) => join(...path);

export const resolvePath = (...path: string[]) => resolve(...path);

export const getFilesFromPathByRule = (rule: string, path: string) => {
  return glob
    .sync(rule, {
      cwd: path,
    })
    .map((file) => resolve(path, file));
};

export const isMatched = (target: string, reg?: RegExp | RegExp[]): boolean => {
  if (!reg) {
    return true;
  }
  if (Array.isArray(reg)) {
    return reg.some((item) => item.test(target));
  } else {
    return reg.test(target);
  }
};

export const sleep = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
