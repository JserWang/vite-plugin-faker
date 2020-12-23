import ts from 'typescript';
import { getIdentifierText, getStringLiteralValue, processTypeReferenceNode } from '../utils';
import { InterfaceEntry } from './interface';
import { getCallExpressionsFromMethod } from './method';

const METHODS = [
  'get',
  'post',
  'upload',
  'put',
  'delete',
  'patch',
  'purge',
  'link',
  'unlink',
  'options',
  'head',
];

export interface ExpressionEntry {
  url: string;
  responseBody: Record<string, any>;
}

/**
 * Serialize request CallExpression
 * @param node
 */
export const serializeExpression = (
  node: ts.CallExpression,
  checker: ts.TypeChecker
): ExpressionEntry => {
  const targetNode = getLeafCallExpression(node);
  const url = getUrlFromArguments(targetNode, checker);
  const customResponseInterface = getCustomResponseInterface(targetNode, checker);
  const typeArgumentInterface = getTypeArgumentInterface(targetNode, checker);

  return {
    url,
    responseBody: getResponseBody(customResponseInterface, typeArgumentInterface),
  };
};

/**
 * Get the url value through the first parameter of request
 * @param node
 * @param checker
 */
const getUrlFromArguments = (node: ts.CallExpression, checker: ts.TypeChecker): string => {
  const urlExpression = node.arguments[0];
  // Assign value via property
  if (ts.isPropertyAccessExpression(urlExpression)) {
    return processPropertyAccessExpression(urlExpression, checker);
  } else if (ts.isStringLiteral(urlExpression)) {
    // Assign value via string
    return getStringLiteralValue(urlExpression);
  }
  return '';
};

const processPropertyAccessExpression = (
  node: ts.PropertyAccessExpression,
  checker: ts.TypeChecker
): string => {
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol) {
    const declaration = symbol.valueDeclaration;
    if (!ts.isPropertyAssignment(declaration) && !ts.isEnumMember(declaration)) {
      return '';
    }
    if (declaration.initializer && ts.isStringLiteral(declaration.initializer)) {
      return getStringLiteralValue(declaration.initializer);
    }
  }
  return '';
};

/**
 * Assemble the response body
 * @param responseBody
 * @param generic
 */
const getResponseBody = (
  responseBody: InterfaceEntry,
  generic: InterfaceEntry | InterfaceEntry[]
) => {
  if (responseBody.properties) {
    const bodyProperties = responseBody.properties;
    Object.keys(bodyProperties).forEach((key) => {
      if (responseBody.generics?.indexOf(bodyProperties[key]) !== -1) {
        bodyProperties[key] = formatInterface(generic);
      }
    });
    return bodyProperties;
  }
  return generic;
};

/**
 * Get CustomResponse corresponding to Interface
 * @param node
 */
const getCustomResponseInterface = (
  node: ts.CallExpression,
  checker: ts.TypeChecker
): InterfaceEntry => {
  // Get the symbol corresponding to the method in the request
  const symbol = checker.getSymbolAtLocation(node.expression);
  if (!symbol) {
    return {};
  }
  // Get the valueDeclaration in the symbol
  const valueDeclaration = symbol.valueDeclaration;
  if (!ts.isMethodDeclaration(valueDeclaration)) {
    return {};
  }
  // Get the return fetch() part of the method
  const expression = getCallExpressionsFromMethod(valueDeclaration)[0];
  if (!ts.isCallExpression(expression)) {
    return {};
  }
  // Get the signature of the fetch method
  const signature = checker.getResolvedSignature(expression);
  // Get the fetch declaration
  const declaration = signature?.getDeclaration();
  if (
    declaration &&
    (ts.isMethodDeclaration(declaration) ||
      ts.isArrowFunction(declaration) ||
      ts.isFunctionDeclaration(declaration))
  ) {
    // Get R = ResponseBody<T> in the second TypeParamter in fetch
    const responseBody = declaration.typeParameters![1].default;
    if (responseBody) {
      return processTypeReferenceNode(responseBody, checker) as InterfaceEntry;
    }
  }
  return {};
};

/**
 * Get the generic corresponding Interface in Request
 * @param node
 */
const getTypeArgumentInterface = (
  node: ts.CallExpression,
  checker: ts.TypeChecker
): InterfaceEntry | InterfaceEntry[] => {
  const typeArgument = node.typeArguments![0];
  if (ts.isTypeReferenceNode(typeArgument)) {
    return processTypeReferenceNode(typeArgument, checker) as InterfaceEntry;
  } else if (ts.isArrayTypeNode(typeArgument)) {
    // just like MUser[]
    return [processTypeReferenceNode(typeArgument.elementType, checker) as InterfaceEntry];
  }
  return {};
};

/**
 * Format interface to Record
 * @param entry
 */
const formatInterface = (
  entry: InterfaceEntry | InterfaceEntry[]
): Record<string, any> | Record<string, any>[] => {
  if (Array.isArray(entry)) {
    return [formatInterface(entry[0])];
  }
  const result = {} as Record<string, any>;
  const properties = entry.properties;
  if (properties) {
    Object.keys(properties).forEach((key) => {
      let value = properties[key];
      if (Array.isArray(value)) {
        value = [formatInterface(value[0])];
      } else if (typeof value === 'object') {
        value = formatInterface(value);
      }
      result[key] = value;
    });
  }
  return result;
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
const getLeafCallExpression = (node: ts.CallExpression): ts.CallExpression => {
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
    return getIdentifierText(expression.name);
  }
  return '';
};
