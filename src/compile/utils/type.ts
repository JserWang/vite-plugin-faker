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

export const getIdentifierText = (identifier: ts.Identifier) => identifier.escapedText.toString();

export const getRealValueFromDeclaration = (declaration: ts.Declaration) => {
  if (ts.isPropertyAssignment(declaration)) {
    if (ts.isStringLiteral(declaration.initializer)) {
      return text2String(declaration.initializer);
    }
  }
};

/**
 * get declarations from interface
 * @param node
 * @param checker
 */
export const getDeclarations = (node: ts.Node, checker: ts.TypeChecker) => {
  const type = checker.getTypeAtLocation(node);
  const symbol = type.symbol || type.aliasSymbol;
  return symbol.getDeclarations() as ts.Declaration[];
};

/**
 * remove the `'` or `"` from StringLiteral
 * @param node
 */
export const text2String = (node: ts.StringLiteral) => {
  return node.getText().replace(/\"/g, '').replace(/\'/g, '');
};
