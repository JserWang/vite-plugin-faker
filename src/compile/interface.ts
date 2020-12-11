import ts from 'typescript';
import { getIdentifierText } from '../utils/type';

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

let checker: ts.TypeChecker;

// 用于缓存已解析过的interface
let cache = new Map<string, InterfaceEntry>();

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
const analysisMembers = (members: ts.NodeArray<ts.TypeElement>) => {
  let properties: Record<string, any> = {};
  members.forEach((typeElement) => {
    if (ts.isPropertySignature(typeElement)) {
      const { key, value } = serializeProperty(typeElement);
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
const serializeProperty = (signature: ts.PropertySignature): IProperty => {
  const typeNode = signature.type;
  if (!typeNode) {
    return { key: '', value: '' };
  }

  let value: string | InterfaceEntry | (string | InterfaceEntry)[];
  if (ts.isTypeReferenceNode(typeNode)) {
    value = processTypeReferenceNode(typeNode);
  } else if (ts.isArrayTypeNode(typeNode) && ts.isTypeReferenceNode(typeNode.elementType)) {
    value = [processTypeReferenceNode(typeNode.elementType)] as (InterfaceEntry | string)[];
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
const serializeHeritageClause = (nodeArray: ts.NodeArray<ts.ExpressionWithTypeArguments>) => {
  const names = [] as string[];
  let properties = {};
  nodeArray.forEach((node) => {
    const entry = processTypeReferenceNode(node.expression);
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

export const processTypeReferenceNode = (
  node: ts.TypeReferenceNode | ts.LeftHandSideExpression | ts.TypeNode
): InterfaceEntry | string => {
  const declaration = getDeclaration(node);
  if (ts.isInterfaceDeclaration(declaration)) {
    return serialize(declaration);
  } else if (ts.isTypeParameterDeclaration(declaration)) {
    // process like T = any
    return getIdentifierText(declaration.name);
  }

  return declaration.getText();
};

const getDeclaration = (node: ts.Node) => {
  const type = checker.getTypeAtLocation(node);
  const symbol = type.symbol || type.aliasSymbol;
  const declarations = symbol?.getDeclarations() as ts.Declaration[];
  return declarations![0];
};

/**
 * 序列化interface
 * @param node
 */
const serialize = (node: ts.InterfaceDeclaration): InterfaceEntry => {
  const fileName = node.getSourceFile().fileName;
  const name = getIdentifierText(node.name);
  const cacheKey = `${fileName}|${name}`;
  // 添加缓存，保证同一个文件名中的同一个节点只解析一次
  // 当缓存中存在，直接从缓存中读
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as InterfaceEntry;
  }

  const entry: InterfaceEntry = {
    name,
    generics: analysisGeneric(node.typeParameters),
    properties: analysisMembers(node.members),
  };

  // 处理interface中extends，因为interface中没有implements关键字，所以这里当存在heritageClauses时，
  // 直接使用取第一个即为extends
  if (node.heritageClauses) {
    const { names, properties } = serializeHeritageClause(node.heritageClauses[0].types);
    entry.extends = names;
    entry.properties = { ...properties, ...entry.properties };
  }

  cache.set(cacheKey, entry);

  return entry;
};

const prepareSerialize = (
  node: ts.InterfaceDeclaration,
  typeChecker: ts.TypeChecker
): InterfaceEntry => {
  checker = typeChecker;
  return serialize(node);
};

export default prepareSerialize;
