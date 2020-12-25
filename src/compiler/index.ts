import ts from 'typescript';
import { ROOT, TS_CONFIG_NAME } from '../constants';
import { TsConfigResolver } from '../resolver/config';
import type { Options } from '../types';
import { getSourceFiles, isMatched, isRequestExpression, resolvePath } from '../utils';
import { getClassMethods, getClassName } from './class';
import { ExpressionEntry, serializeExpression } from './expression';
import { getMethodEntry } from './method';

const configResolver = new TsConfigResolver(resolvePath(ROOT, TS_CONFIG_NAME));

export const compileClass = (files: string[], opts: Options) => {
  const { sourceFiles, checker } = getSourceFiles(files, configResolver.getCompilerOptions());
  let result = new Array<ExpressionEntry | null>();

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      const className = getClassName(node);
      // According to includes and excludes to get qualified class
      if (!isMatched(className, opts.includes) || isMatched(className, opts.excludes)) {
        return;
      }

      const methods = getClassMethods(node);
      // Get all expression in method
      let expressions = new Array<ts.CallExpression>();
      methods.forEach((method) => {
        expressions = expressions.concat(getMethodEntry(method).expressions);
      });

      // Get request expressions
      expressions = expressions.filter((exp) => isRequestExpression(exp));

      result = expressions.map((expression) => serializeExpression(expression, checker));
    }
  };

  sourceFiles.forEach((sourceFile) => {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  });

  return result;
};
