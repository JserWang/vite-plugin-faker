import ts from 'typescript';
import type { Options } from '../types';
import { getFilesFromPathByRule, isMatched, resolvePath } from '../utils/tool';
import { getCompilerOptions, getSourceFiles } from '../utils/type';
import serializeClass from './class';
import serializeExpression, { ExpressionEntry } from './expression';
import serializeMethod from './method';

const root = process.cwd();

const TS_CONFIG_NAME = 'tsconfig.json';

export default (path: string, opts: Options) => {
  const files = getFilesFromPathByRule('**/*.ts', path);
  const configPath = resolvePath(root, TS_CONFIG_NAME);
  const compilerOptions = getCompilerOptions(configPath);
  const { sourceFiles, checker } = getSourceFiles(files, compilerOptions);
  const result = [] as ExpressionEntry[];

  const visit = (node: ts.Node): any => {
    if (ts.isClassDeclaration(node)) {
      const classEntry = serializeClass(node);
      // only process files that meet the inclusion rules or the exclusion rules
      if (!isMatched(classEntry.name, opts.includes) || isMatched(classEntry.name, opts.excludes)) {
        return;
      }
      // get all expression in method
      let expressions = [] as ts.Expression[];
      classEntry.methods.forEach((method) => {
        expressions = expressions.concat(serializeMethod(method));
      });

      expressions.forEach((expression) => {
        if (ts.isCallExpression(expression)) {
          result.push(serializeExpression(expression, checker));
        }
      });
    }
  };

  sourceFiles.forEach((sourceFile) => {
    // ignore `*.d.ts` files
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  });

  return result;
};
