import ts from 'typescript';
import { getIdentifierText, getStringLiteralValue, processTypeReferenceNode } from '../utils/types';
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
 * 序列化request CallExpression
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
 * 通过request 第一个参数得到url值
 * @param node
 * @param checker
 */
const getUrlFromArguments = (node: ts.CallExpression, checker: ts.TypeChecker): string => {
  const urlExpression = node.arguments[0];
  // 通过引用赋值
  if (ts.isPropertyAccessExpression(urlExpression)) {
    return processPropertyAccessExpression(urlExpression, checker);
  } else if (ts.isStringLiteral(urlExpression)) {
    // 直接字符串赋值
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
 * 获得response body
 * @param responseBody
 * @param generic
 */
const getResponseBody = (responseBody: InterfaceEntry, generic: InterfaceEntry) => {
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
 * 得到CustomResponse对应Interface
 * @param node
 */
const getCustomResponseInterface = (
  node: ts.CallExpression,
  checker: ts.TypeChecker
): InterfaceEntry => {
  // 得到request中method对应的symbol
  const symbol = checker.getSymbolAtLocation(node.expression);
  if (!symbol) {
    return {};
  }
  // 得到symbol中valueDeclaration
  const valueDeclaration = symbol.valueDeclaration;
  if (!ts.isMethodDeclaration(valueDeclaration)) {
    return {};
  }
  // 得到method中的return fetch()部分
  const expression = getCallExpressionsFromMethod(valueDeclaration)[0];
  if (!ts.isCallExpression(expression)) {
    return {};
  }
  // 得到fetch方法的Signature
  const signature = checker.getResolvedSignature(expression);
  // 拿到fetch的declaration
  const declaration = signature?.getDeclaration();
  if (
    declaration &&
    (ts.isMethodDeclaration(declaration) ||
      ts.isArrowFunction(declaration) ||
      ts.isFunctionDeclaration(declaration))
  ) {
    // 得到fetch中第二个TypeParamter中的 R = ResponseBody<T>
    const responseBody = declaration.typeParameters![1].default;
    if (responseBody) {
      return processTypeReferenceNode(responseBody, checker) as InterfaceEntry;
    }
  }
  return {};
};

/**
 * 得到Request中泛型对应Interface
 * @param node
 */
const getTypeArgumentInterface = (
  node: ts.CallExpression,
  checker: ts.TypeChecker
): InterfaceEntry => {
  const typeArgument = node.typeArguments![0];
  if (ts.isTypeReferenceNode(typeArgument)) {
    const res = processTypeReferenceNode(typeArgument, checker);
    if (typeof res !== 'string') {
      return res;
    }
  }
  return {};
};

/**
 * interface 格式化
 * @param entry
 */
const formatInterface = (entry: InterfaceEntry) => {
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
 * 通过methods判断CallExpression是否为Request请求
 * @param node
 */
export const isRequestExpression = (node: ts.CallExpression): boolean => {
  const targetNode = getLeafCallExpression(node);
  return METHODS.indexOf(getExpressionName(targetNode)) !== -1;
};

/**
 * 递归找到AST中叶子节点的CallExpression
 *
 * 例如：
 * Request.get().then().then() 的AST结构对应关系：
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
