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

  test('class name', () => {
    const expected = 'PlayGroundService';
    const node = getTargetNodeByKind(classes, 'PlayGroundService');
    if (node) {
      expect(getClassName(node)).toBe(expected);
    }
  });

  test('class methods', () => {
    const node = getTargetNodeByKind(classes, 'PlayGroundService');
    if (node) {
      const methods = getClassMethods(node);
      methods.forEach((item) => {
        expect(item.kind).toEqual(ts.SyntaxKind.MethodDeclaration);
      });
    }
  });
});
