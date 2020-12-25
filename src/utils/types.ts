import ts from 'typescript';
import { InterfaceEntry, serializeInterface } from '../compiler/interface';
import { METHODS } from '../constants';

export const getSourceFiles = (files: string[], opts: ts.CompilerOptions) => {
  const program = ts.createProgram(files, opts);
  return {
    sourceFiles: program.getSourceFiles(),
    checker: program.getTypeChecker(),
  };
};

/**
 * Get the value of escapedText in Identifier
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
 * Get the actual value of StringLiteral
 * @param node
 */
export const getStringLiteralValue = (node: ts.StringLiteral): string => toString(node.getText());

/**
 * TypeReference to interface or generic string
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

/**
 * Determine whether CallExpression is a Request by METHODS
 * @param node
 */
export const isRequestExpression = (node: ts.CallExpression): boolean => {
  const targetNode = getLeafCallExpression(node);
  return METHODS.indexOf(getExpressionName(targetNode)) !== -1;
};

/**
 * Recursively find the CallExpression of the leaf node in the AST
 *
 * such as:
 * The AST structure correspondence of `Request.get().then().then()`:
 *
 * CallExpression -- Request.get().then().then()
 *  PropertyAccessExpression
 *    CallExpression -- Request.get().then()
 *      PropertyAccessExpression
 *        CallExpression -- Request.get()
 *          PropertyAccessExpression
 *          TypeReference
 *
 * @param node
 */
export const getLeafCallExpression = (node: ts.CallExpression): ts.CallExpression => {
  const nodeExpression = node.expression;
  if (
    ts.isPropertyAccessExpression(nodeExpression) &&
    ts.isCallExpression(nodeExpression.expression)
  ) {
    return getLeafCallExpression(nodeExpression.expression);
  }
  return node;
};

const getExpressionName = (node: ts.CallExpression): string => {
  const expression = node.expression;
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
    return getIdentifierText(expression.name).toLocaleLowerCase();
  }
  return '';
};
