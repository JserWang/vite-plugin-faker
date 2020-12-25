import ts from 'typescript';
import { INDEXABLE_TYPE } from '../constants';
import { getIdentifierText, processTypeReferenceNode } from '../utils';

interface IProperty {
  key: string;
  kind?: any;
  value?: any;
}

export interface InterfaceEntry {
  name?: string;
  generics?: string[];
  extends?: string[];
  properties?: IProperty[];
}

/**
 * Get generic types in interface
 * @param paramDeclarations
 */
const getGeneric = (paramDeclarations: ts.NodeArray<ts.TypeParameterDeclaration>): string[] =>
  paramDeclarations.map((declaration) => getIdentifierText(declaration.name));

/**
 * Get members in interface
 * @param members
 */
const eachMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  checker: ts.TypeChecker
): IProperty[] => {
  let properties = new Array<IProperty>();

  members.forEach((typeElement) => {
    if (ts.isPropertySignature(typeElement)) {
      properties.push(serializeProperty(typeElement, checker));
    } else if (ts.isIndexSignatureDeclaration(typeElement)) {
      properties.push(serializeIndexable(typeElement, checker));
    }
  });
  return properties;
};

/**
 * Serialize each property and its corresponding type
 * @param signature
 */
const serializeProperty = (signature: ts.PropertySignature, checker: ts.TypeChecker): IProperty => {
  const typeNode = signature.type;
  if (!typeNode) {
    return { key: '' };
  }
  return {
    key: ts.isIdentifier(signature.name) ? getIdentifierText(signature.name) : '',
    kind: typeNode.kind,
    value: serializePropertyValue(typeNode, checker),
  };
};

/**
 * Serialize indexable types
 * @param signature
 * @param checker
 */
const serializeIndexable = (
  signature: ts.IndexSignatureDeclaration,
  checker: ts.TypeChecker
): IProperty => {
  const typeNode = signature.type;

  return {
    key: INDEXABLE_TYPE,
    kind: typeNode.kind,
    value: serializePropertyValue(typeNode, checker),
  };
};

/**
 * Serialize property value
 * When the property type is other interface, call serializeInterface again
 * @param node
 * @param checker
 */
const serializePropertyValue = (node: ts.Node, checker: ts.TypeChecker): any => {
  if (ts.isTypeReferenceNode(node)) {
    return processTypeReferenceNode(node, checker);
  } else if (ts.isArrayTypeNode(node)) {
    return serializePropertyValue(node.elementType, checker);
  } else if (ts.isLiteralTypeNode(node)) {
    const type = checker.getTypeAtLocation(node);
    return type.isStringLiteral() || type.isNumberLiteral() ? type.value : node.getText();
  }
  return node.getText();
};

/**
 * process interface extends case
 * @param nodeArray
 */
const serializeHeritageClause = (
  nodeArray: ts.NodeArray<ts.ExpressionWithTypeArguments>,
  checker: ts.TypeChecker
) => {
  const superNames = new Array<string>();
  let properties = new Array<IProperty>();

  nodeArray.forEach((node) => {
    const entry = processTypeReferenceNode(node.expression, checker);
    if (typeof entry !== 'string') {
      superNames.push(entry.name || '');
      properties = properties.concat(entry.properties || []);
    }
  });
  return {
    superNames,
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
    properties: eachMembers(node.members, checker),
  };

  if (node.typeParameters) {
    entry.generics = getGeneric(node.typeParameters);
  }

  // Process the extends in the interface, because there is no implements keyword in the interface, so here when there is heritageClauses,
  // Use the first one directly to be extends
  if (node.heritageClauses) {
    const { superNames, properties } = serializeHeritageClause(
      node.heritageClauses[0].types,
      checker
    );
    entry.extends = superNames;
    entry.properties = properties.concat(entry.properties || []);
  }

  return entry;
};
