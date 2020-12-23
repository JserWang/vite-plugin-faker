/**
 * method => block => statement => expression
 */
import ts from 'typescript';

/**
 * Get all CallExpression in method
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
 * Process block in statement
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
 * Get the ExpressionStatement and ReturnStatement in statement
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
 * Process ifStatement
 * @param statement
 */
const processIfStatement = (statement: ts.IfStatement) => {
  let expressions = new Array<ts.Expression>();
  // Process the expression contained in the block in the if
  if (ts.isBlock(statement.thenStatement)) {
    expressions = mergeExpressions(expressions, processBlock(statement.thenStatement));
  }

  // When there is else
  // NOTE: when there is `else if`, the elseStatement here may also contain ifStatement
  if (statement.elseStatement) {
    if (ts.isIfStatement(statement.elseStatement)) {
      // Process else if
      expressions = mergeExpressions(expressions, processIfStatement(statement.elseStatement));
    } else if (ts.isBlock(statement.elseStatement)) {
      // Process else
      expressions = mergeExpressions(expressions, processBlock(statement.elseStatement));
    }
  }
  return expressions;
};

/**
 * Merge the expressions to a new array
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
