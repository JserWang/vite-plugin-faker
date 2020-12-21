import ts from 'typescript';
import { getIdentifierText, processTypeReferenceNode } from '../utils';

interface IProperty {
  key: string;
  value?: any;
}

export interface InterfaceEntry {
  name?: string;
  generics?: string[] | undefined;
  extends?: string[] | undefined;
  properties?: Record<string, any>;
}

/**
 * 处理 interface 中泛型
 * @param paramDecls
 */
const analysisGeneric = (
  paramDecls: ts.NodeArray<ts.TypeParameterDeclaration> | undefined
): string[] => {
  if (paramDecls) {
    return paramDecls.map((decl) => getIdentifierText(decl.name));
  }
  return [];
};

/**
 * 处理 interface 中定义属性
 * @param members
 */
const analysisMembers = (members: ts.NodeArray<ts.TypeElement>, checker: ts.TypeChecker) => {
  let properties: Record<string, any> = {};
  members.forEach((typeElement) => {
    if (ts.isPropertySignature(typeElement)) {
      const { key, value } = serializeProperty(typeElement, checker);
      properties[key] = value;
    }
  });
  return properties;
};

/**
 * 序列化每条属性以及属性对应类型
 * 当属性类型为其他interface时，再次调用interface的serialize
 * @param signature
 */
const serializeProperty = (signature: ts.PropertySignature, checker: ts.TypeChecker): IProperty => {
  const typeNode = signature.type;
  if (!typeNode) {
    return { key: '', value: '' };
  }

  let value: string | InterfaceEntry | (string | InterfaceEntry)[];
  if (ts.isTypeReferenceNode(typeNode)) {
    value = processTypeReferenceNode(typeNode, checker);
  } else if (ts.isArrayTypeNode(typeNode) && ts.isTypeReferenceNode(typeNode.elementType)) {
    value = [processTypeReferenceNode(typeNode.elementType, checker)] as (
      | InterfaceEntry
      | string
    )[];
  } else {
    value = typeNode.getText();
  }
  return {
    key: ts.isIdentifier(signature.name) ? getIdentifierText(signature.name) : '',
    value,
  };
};

/**
 * 处理extends情况
 * @param nodeArray
 */
const serializeHeritageClause = (
  nodeArray: ts.NodeArray<ts.ExpressionWithTypeArguments>,
  checker: ts.TypeChecker
) => {
  const names = [] as string[];
  let properties = {};
  nodeArray.forEach((node) => {
    const entry = processTypeReferenceNode(node.expression, checker);
    if (typeof entry !== 'string') {
      names.push(entry.name || '');
      properties = {
        ...properties,
        ...entry.properties,
      };
    }
  });
  return {
    names,
    properties,
  };
};

/**
 * 序列化interface
 * @param node
 */
export const serializeInterface = (
  node: ts.InterfaceDeclaration,
  checker: ts.TypeChecker
): InterfaceEntry => {
  const name = getIdentifierText(node.name);

  const entry: InterfaceEntry = {
    name,
    generics: analysisGeneric(node.typeParameters),
    properties: analysisMembers(node.members, checker),
  };

  // 处理interface中extends，因为interface中没有implements关键字，所以这里当存在heritageClauses时，
  // 直接使用取第一个即为extends
  if (node.heritageClauses) {
    const { names, properties } = serializeHeritageClause(node.heritageClauses[0].types, checker);
    entry.extends = names;
    entry.properties = { ...properties, ...entry.properties };
  }

  return entry;
};
