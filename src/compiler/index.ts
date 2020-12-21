import ts from 'typescript';
import { ROOT, TS_CONFIG_NAME } from '../constants';
import { TsConfigResolver } from '../resolver/config';
import type { Options } from '../types';
import { getSourceFiles, isMatched, resolvePath } from '../utils';
import { getClassMethods, getClassName } from './class';
import { ExpressionEntry, isRequestExpression, serializeExpression } from './expression';
import { getCallExpressionsFromMethod } from './method';

const configResolver = new TsConfigResolver(resolvePath(ROOT, TS_CONFIG_NAME));

export const compileClass = (files: string[], opts: Options) => {
  const { sourceFiles, checker } = getSourceFiles(files, configResolver.getCompilerOptions());
  let result = new Array<ExpressionEntry>();

  const visit = (node: ts.Node): any => {
    if (ts.isClassDeclaration(node)) {
      const className = getClassName(node);
      // 根据includes和excludes得到符合条件的class
      if (!isMatched(className, opts.includes) || isMatched(className, opts.excludes)) {
        return null;
      }

      const methods = getClassMethods(node);
      // get all expression in method
      let expressions = [] as ts.CallExpression[];
      methods.forEach((method) => {
        expressions = expressions.concat(getCallExpressionsFromMethod(method));
      });

      // 获得为Request的Expression
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
