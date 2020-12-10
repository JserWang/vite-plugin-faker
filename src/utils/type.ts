import { existsSync } from 'fs';
import ts from 'typescript';

export const getCompilerOptions = (configPath: string): ts.CompilerOptions => {
  if (existsSync(configPath)) {
    return ts.convertCompilerOptionsFromJson(require(configPath), './').options;
  }
  return {
    module: ts.ModuleKind.ES2015,
    target: ts.ScriptTarget.ESNext,
  } as ts.CompilerOptions;
};

export const getSourceFiles = (files: string[], opts: ts.CompilerOptions) => {
  const program = ts.createProgram(files, opts);
  return {
    sourceFiles: program.getSourceFiles(),
    checker: program.getTypeChecker(),
  };
};

/**
 * 获取Identifier中escapedText值
 * @param identifier
 */
export const getIdentifierText = (identifier: ts.Identifier | undefined): string =>
  identifier ? identifier.escapedText.toString() : '';

/**
 * Get text from StringLiteral and remove the `'` or `"`
 * @param node
 */
export const toString = (node: ts.StringLiteral) => {
  return node.getText().replace(/\"/g, '').replace(/\'/g, '');
};
