/**
 * VedicMind AI — Deterministic Mathematical Verification Engine
 */
class MathVerifier {
  static solveNikhilamMultiplication(num1, num2) {
    const n1 = Number(num1);
    const n2 = Number(num2);
    const maxNum = Math.max(Math.abs(n1), Math.abs(n2));
    let base = 10;
    while (base <= maxNum || base < 100) {
      if (maxNum < base * 1.5) break;
      base *= 10;
    }
    if (base < 100 && maxNum > 80) base = 100;
    if (base < 1000 && maxNum > 800) base = 1000;

    const dev1 = n1 - base;
    const dev2 = n2 - base;
    const leftPart = n1 + dev2;
    const rightPart = dev1 * dev2;
    const expectedProduct = n1 * n2;

    return {
      num1: n1,
      num2: n2,
      base,
      dev1,
      dev2,
      leftPart,
      rightPart,
      result: expectedProduct,
      steps: [
        'Identify Base: ' + base,
        'Find deviations from base: ' + n1 + ' -> (' + (dev1 >= 0 ? '+' : '') + dev1 + '), ' + n2 + ' -> (' + (dev2 >= 0 ? '+' : '') + dev2 + ')',
        'Left part of product: ' + n1 + ' + (' + dev2 + ') = ' + leftPart,
        'Right part of product: (' + dev1 + ') * (' + dev2 + ') = ' + rightPart,
        'Combined result: (' + leftPart + ' * ' + base + ') + (' + rightPart + ') = ' + expectedProduct
      ],
      sutra: 'Nikhilam Navatashcaramam Dashatah (All from 9 and the last from 10)'
    };
  }

  static solveEkadhikenaSquare(num) {
    const n = Number(num);
    if (n % 10 !== 5) {
      return {
        applicable: false,
        result: n * n,
        steps: ['Standard squaring: ' + n + ' * ' + n + ' = ' + (n * n)]
      };
    }
    const tens = Math.floor(n / 10);
    const nextVal = tens + 1;
    const left = tens * nextVal;
    const right = 25;
    const result = n * n;

    return {
      applicable: true,
      num: n,
      tens,
      nextVal,
      left,
      right,
      result,
      steps: [
        'Separate the tens digit: ' + tens + ' and the units digit: 5',
        'Apply Ekadhikena Purvena: multiply ' + tens + ' by (' + tens + ' + 1) = ' + left,
        'Square of units digit (5^2): ' + right,
        'Append right to left: ' + left + right + ' = ' + result
      ],
      sutra: 'Ekadhikena Purvena (By one more than the previous one)'
    };
  }

  static solveUrdhva2Digit(num1, num2) {
    const n1 = Number(num1);
    const n2 = Number(num2);
    const a = Math.floor(n1 / 10);
    const b = n1 % 10;
    const c = Math.floor(n2 / 10);
    const d = n2 % 10;

    const step1 = b * d;
    const step2 = (a * d) + (b * c);
    const step3 = a * c;
    const result = n1 * n2;

    return {
      num1: n1,
      num2: n2,
      digits: { a, b, c, d },
      step1,
      step2,
      step3,
      result,
      steps: [
        'Step 1 (Vertical Right): ' + b + ' * ' + d + ' = ' + step1,
        'Step 2 (Crosswise Middle): (' + a + ' * ' + d + ') + (' + b + ' * ' + c + ') = ' + step2,
        'Step 3 (Vertical Left): ' + a + ' * ' + c + ' = ' + step3,
        'Combine with carries: ' + result
      ],
      sutra: 'Urdhva Tiryagbhyam (Vertically and Crosswise)'
    };
  }

  static verifyExpression(expression, studentOrAiAnswer) {
    try {
      const cleanExpr = String(expression)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/[^-\d/*+.()]/g, '');

      const calculated = Function("'use strict'; return (" + cleanExpr + ")")();
      const studentVal = parseFloat(studentOrAiAnswer);
      const isCorrect = Math.abs(calculated - studentVal) < 0.0001;

      return {
        expression,
        sanitizedExpression: cleanExpr,
        expectedResult: calculated,
        submittedAnswer: studentVal,
        isValid: isCorrect,
        confidence: 1.0,
        difference: Math.abs(calculated - studentVal)
      };
    } catch (err) {
      return {
        expression,
        error: err.message,
        isValid: false,
        confidence: 0.0
      };
    }
  }

  static analyzeMistake(expected, submitted, operation = 'multiplication') {
    const exp = Number(expected);
    const sub = Number(submitted);
    const diff = Math.abs(exp - sub);
    if (diff === 0) return { isError: false };

    let category = 'Calculation Error';
    let explanation = 'Arithmetic calculation inaccuracy.';
    let suggestion = 'Review the step-by-step Vedic sutra application.';

    if (diff % 10 === 0 || diff === 1 || diff === 10) {
      category = 'Carry/Borrow Error';
      explanation = 'You missed carrying over or borrowing a digit during calculation.';
      suggestion = 'Write out carry digits explicitly above each column.';
    } else if (exp !== 0 && (Math.abs(exp * 10 - sub) < 0.01 || Math.abs(sub * 10 - exp) < 0.01)) {
      category = 'Place Value / Decimal Error';
      explanation = 'The magnitude or decimal point shifted by a power of 10.';
      suggestion = 'Count base zeroes carefully when combining left and right parts.';
    } else if (operation === 'nikhilam' && sub < exp / 2) {
      category = 'Method Selection Error';
      explanation = 'Deviation signs (positive vs negative) were likely inverted.';
      suggestion = 'Remember: below base = negative deviation, above base = positive deviation.';
    }

    return {
      isError: true,
      category,
      explanation,
      suggestion,
      expected: exp,
      submitted: sub
    };
  }
}

module.exports = MathVerifier;
