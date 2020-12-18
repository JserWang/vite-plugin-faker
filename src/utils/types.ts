import ts from 'typescript';
import { InterfaceEntry, serializeInterface } from '../compiler/interface';

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
 * remove the `'` or `"`
 * @param value
 */
export const toString = (value: string) => {
  return value.replace(/\"/g, '').replace(/\'/g, '');
};

/**
 * 得到StringLiteral实际值
 * @param node
 */
export const getStringLiteralValue = (node: ts.StringLiteral): string => toString(node.getText());

/**
 * 序列化TypeReference
 * @param node
 * @param checker
 */
export const processTypeReferenceNode = (
  node: ts.TypeReferenceNode | ts.LeftHandSideExpression | ts.TypeNode,
  checker: ts.TypeChecker
): InterfaceEntry | string => {
  const declaration = getDeclaration(node, checker);
  if (ts.isInterfaceDeclaration(declaration)) {
    return serializeInterface(declaration, checker);
  } else if (ts.isTypeParameterDeclaration(declaration)) {
    // process like T = any
    return getIdentifierText(declaration.name);
  }

  return declaration.getText();
};

const getDeclaration = (node: ts.Node, checker: ts.TypeChecker) => {
  const type = checker.getTypeAtLocation(node);
  const symbol = type.symbol || type.aliasSymbol;
  const declarations = symbol?.getDeclarations() as ts.Declaration[];
  return declarations![0];
};
