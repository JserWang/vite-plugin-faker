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
 * Get generic types in interface
 * @param paramDecls
 */
const analysisGeneric = (paramDecls: ts.NodeArray<ts.TypeParameterDeclaration>): string[] =>
  paramDecls.map((decl) => getIdentifierText(decl.name));

/**
 * Get members in interface
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
 * Serialize each attribute and its corresponding type
 * When the attribute type is other interface, call serializeInterface again
 * @param signature
 */
const serializeProperty = (signature: ts.PropertySignature, checker: ts.TypeChecker): IProperty => {
  const typeNode = signature.type;
  if (!typeNode) {
    return { key: '', value: '' };
  }

  let value: string | number | InterfaceEntry | (string | number | InterfaceEntry)[];
  if (ts.isTypeReferenceNode(typeNode)) {
    value = processTypeReferenceNode(typeNode, checker);
  } else if (ts.isArrayTypeNode(typeNode) && ts.isTypeReferenceNode(typeNode.elementType)) {
    value = [processTypeReferenceNode(typeNode.elementType, checker)] as (
      | InterfaceEntry
      | string
    )[];
  } else if (ts.isLiteralTypeNode(typeNode)) {
    const type = checker.getTypeAtLocation(typeNode);
    value = type.isStringLiteral() || type.isNumberLiteral() ? type.value : typeNode.getText();
  } else {
    value = typeNode.getText();
  }
  return {
    key: ts.isIdentifier(signature.name) ? getIdentifierText(signature.name) : '',
    value,
  };
};

/**
 * process interface extends case
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
 * serialize interface
 * @param node
 */
export const serializeInterface = (
  node: ts.InterfaceDeclaration,
  checker: ts.TypeChecker
): InterfaceEntry => {
  const name = getIdentifierText(node.name);

  const entry: InterfaceEntry = {
    name,
    properties: analysisMembers(node.members, checker),
  };

  if (node.typeParameters) {
    entry.generics = analysisGeneric(node.typeParameters);
  }

  // Process the extends in the interface, because there is no implements keyword in the interface, so here when there is heritageClauses,
  // Use the first one directly to be extends
  if (node.heritageClauses) {
    const { names, properties } = serializeHeritageClause(node.heritageClauses[0].types, checker);
    entry.extends = names;
    entry.properties = { ...properties, ...entry.properties };
  }

  return entry;
};
