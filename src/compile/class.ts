import ts from 'typescript';
import { getIdentifierText } from '../utils/type';

interface ClassEntry {
  name: string;
  methods: ts.MethodDeclaration[];
}

/**
 * 序列化 class
 */
export default (node: ts.ClassDeclaration): ClassEntry => {
  const name = getIdentifierText(node.name);
  const methods = [] as ts.MethodDeclaration[];
  node.members.forEach((declaration) => {
    if (ts.isMethodDeclaration(declaration)) {
      methods.push(declaration);
    }
  });

  return {
    name,
    methods,
  };
};
