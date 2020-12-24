import ts from 'typescript';
import { getClassMethods, getClassName } from '../../src/compiler/class';
import { isRequestExpression } from '../../src/compiler/expression';
import { getCallExpressionsFromMethod } from '../../src/compiler/method';
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
    const node = getTargetNodeByKind(classes, expected);
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
      expect(methods).toHaveLength(6);
    }
  });

  test('filter PlayGroundService requestExpression', () => {
    const node = getTargetNodeByKind(classes, 'PlayGroundService');
    if (node) {
      const methods = getClassMethods(node);
      let expressions = new Array<ts.CallExpression>();
      methods.forEach((method) => {
        expressions = expressions.concat(getCallExpressionsFromMethod(method));
      });
      expressions = expressions.filter((exp) => isRequestExpression(exp));

      expect(expressions).toHaveLength(7);
    }
  });

  test('PlayGroundService getApi is not RequestExpression', () => {
    const node = getTargetNodeByKind(classes, 'PlayGroundService');
    if (node) {
      const methods = getClassMethods(node);
      methods.forEach((item) => {
        if (ts.isIdentifier(item.name) && getIdentifierText(item.name) === 'getApi') {
          const expressions = getCallExpressionsFromMethod(item);
          expect(isRequestExpression(expressions[0])).toBe(false);
        }
      });
    }
  });
});
