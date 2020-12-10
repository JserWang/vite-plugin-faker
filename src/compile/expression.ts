import ts from 'typescript';
import { toString } from '../utils/type';
import serializeInterface, { InterfaceEntry, processTypeReferenceNode } from './interface';

let checker: ts.TypeChecker;

export interface ExpressionEntry {
  url: string;
  responseBody: Record<string, any>;
}

const processStringLiteral = (node: ts.StringLiteral): string => toString(node);

const processPropertyAccessExpression = (node: ts.PropertyAccessExpression): string => {
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol) {
    const declaration = symbol.valueDeclaration;
    if (ts.isPropertyAssignment(declaration) || ts.isEnumMember(declaration)) {
      if (declaration.initializer && ts.isStringLiteral(declaration.initializer)) {
        return processStringLiteral(declaration.initializer);
      }
    }
  }
  return '';
};

const getUrlFromArguments = (node: ts.CallExpression): string => {
  const urlExpression = node.arguments[0];
  if (ts.isPropertyAccessExpression(urlExpression)) {
    return processPropertyAccessExpression(urlExpression);
  } else if (ts.isStringLiteral(urlExpression)) {
    return processStringLiteral(urlExpression);
  }
  return '';
};

/**
 * 得到ResponseBody对应Interface
 * @param node
 */
const getResponseBodyInterface = (node: ts.CallExpression): InterfaceEntry => {
  const signature = checker.getResolvedSignature(node);
  if (signature) {
    const returnType = checker.getReturnTypeOfSignature(signature) as ts.TypeReference;
    const declaration = returnType.typeArguments![0].getSymbol()?.declarations[0];
    if (declaration && ts.isInterfaceDeclaration(declaration)) {
      return serializeInterface(declaration, checker);
    }
  }
  return {};
};

/**
 * 拿到Request中泛型对应Interface
 * @param node
 */
const getTypeArgsInterface = (node: ts.TypeNode): InterfaceEntry => {
  if (ts.isTypeReferenceNode(node)) {
    const res = processTypeReferenceNode(node);
    if (typeof res !== 'string') {
      return res;
    }
  }
  return {};
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
  } else {
    return generic;
  }
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
 * 序列化call expression
 * @param node
 */
const serialize = (node: ts.CallExpression): ExpressionEntry => ({
  url: getUrlFromArguments(node),
  responseBody: getResponseBody(
    getResponseBodyInterface(node),
    getTypeArgsInterface(node.typeArguments![0])
  ),
});

const prepareSerialize = (node: ts.CallExpression, typeChecker: ts.TypeChecker) => {
  checker = typeChecker;
  return serialize(node);
};

export default prepareSerialize;
