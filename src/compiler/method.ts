/**
 * method => block => statement => expression
 */
import ts from 'typescript';

/**
 * 获得method中的所有CallExpression
 * @param node
 */
export const getCallExpressionsFromMethod = (node: ts.MethodDeclaration): ts.CallExpression[] => {
  const methodBody = node.body;
  if (methodBody && ts.isBlock(methodBody)) {
    return processBlock(methodBody).filter((expression) =>
      ts.isCallExpression(expression)
    ) as ts.CallExpression[];
  }
  return [];
};

/**
 * 处理block中的statement
 * @param block
 */
const processBlock = (block: ts.Block): ts.Expression[] => {
  let expressions = new Array<ts.Expression>();
  block?.statements.forEach((statement) => {
    expressions = mergeExpressions(expressions, processStatement(statement));
  });
  return expressions;
};

/**
 * 处理statement，得到其中包含的ExpressionStatement以及ReturnStatement
 * @param statement
 */
const processStatement = (statement: ts.Statement): ts.Expression | ts.Expression[] => {
  if (ts.isIfStatement(statement)) {
    return processIfStatement(statement);
  } else if (ts.isExpressionStatement(statement) || ts.isReturnStatement(statement)) {
    return statement.expression ? statement.expression : [];
  }
  return [];
};

/**
 * 处理ifStatement
 * @param statement
 */
const processIfStatement = (statement: ts.IfStatement) => {
  let expressions = new Array<ts.Expression>();
  // 处理if中block中包含的expression
  if (ts.isBlock(statement.thenStatement)) {
    expressions = mergeExpressions(expressions, processBlock(statement.thenStatement));
  }

  // 当存在else时，注意：当存在`else if`时这里的elseStatement可能还会包含ifStatement
  if (statement.elseStatement) {
    if (ts.isIfStatement(statement.elseStatement)) {
      // 处理 else if
      expressions = mergeExpressions(expressions, processIfStatement(statement.elseStatement));
    } else if (ts.isBlock(statement.elseStatement)) {
      // 处理 else
      expressions = mergeExpressions(expressions, processBlock(statement.elseStatement));
    }
  }
  return expressions;
};

/**
 * 将expression合并，返回一个新的expression集合
 * @param target1
 * @param target2
 */
const mergeExpressions = (
  target1: ts.Expression | ts.Expression[],
  target2: ts.Expression | ts.Expression[]
): ts.Expression[] => {
  let result = new Array<ts.Expression>();
  Array.isArray(target1) ? (result = result.concat(target1)) : result.push(target1);
  Array.isArray(target2) ? (result = result.concat(target2)) : result.push(target2);
  return result;
};
