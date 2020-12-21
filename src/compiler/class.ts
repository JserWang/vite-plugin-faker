import ts from 'typescript';
import { getIdentifierText } from '../utils';

/**
 * Get class name
 * @param node
 */
export const getClassName = (node: ts.ClassDeclaration): string => {
  return getIdentifierText(node.name);
};

/**
 * Get class methods
 */
export const getClassMethods = (node: ts.ClassDeclaration): ts.MethodDeclaration[] => {
  const methods = new Array<ts.MethodDeclaration>();
  node.members.forEach((declaration) => {
    if (ts.isMethodDeclaration(declaration)) {
      methods.push(declaration);
    }
  });
  return methods;
};
