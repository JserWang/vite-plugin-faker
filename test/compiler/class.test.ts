import ts from 'typescript';
import { getClassMethods, getClassName } from '../../src/compiler/class';
import { getIdentifierText } from '../../src/utils';
import { getBindingResult, getTargetNodesByKind } from '../../src/utils/testUtils';

const getTargetNodeByKind = (
  nodes: ts.ClassDeclaration[],
  nodeName: string
): ts.ClassDeclaration | null => {
  const targetNodes = nodes.filter((node) => getIdentifierText(node.name) === nodeName);
  return targetNodes.length > 0 ? targetNodes[0] : null;
};

describe('class', () => {
  let classes: ts.ClassDeclaration[];

  beforeAll(() => {
    const bindingResult = getBindingResult('services');
    classes = getTargetNodesByKind(
      bindingResult.sourceFiles,
      ts.SyntaxKind.ClassDeclaration
    ) as ts.ClassDeclaration[];
  });

  test('get class name', () => {
    const node = getTargetNodeByKind(classes, 'TestService');
    const expected = 'TestService';
    if (node) {
      expect(getClassName(node)).toBe(expected);
    }
  });

  test('get class methods', () => {
    const node = getTargetNodeByKind(classes, 'TestService');
    if (node) {
      getClassMethods(node).forEach((item) => {
        expect(item.kind).toEqual(ts.SyntaxKind.MethodDeclaration);
      });
      expect(getClassMethods(node)).toHaveLength(2);
    }
  });
});
