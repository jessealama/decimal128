const zero = BigInt(0);
const one = BigInt(1);
const minusOne = BigInt(-1);
const ten = BigInt(10);

type Digit = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // -1 signals that we're moving from the integer part to the decimal part of a decimal number

function gcd(a: bigint, b: bigint): bigint {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function countSignificantDigits(s: string): number {
    if (s.match(/^0+[1-9]$/)) {
        return countSignificantDigits(s.replace(/^0+/, ""));
    }

    if (s.match(/^0[.]/)) {
        let m = s.match(/[.]0+/);

        if (m) {
            return s.length - m[0].length - 1;
        }

        return s.length - 2;
    }

    if (s.match(/[.]/)) {
        return s.length - 1;
    }

    let m = s.match(/0+$/);

    if (m) {
        return s.length - m[0].length;
    }

    return s.length;
}

function* nextDigitForDivision(
    x: bigint,
    y: bigint,
    n: number
): Generator<Digit> {
    let result = "0";
    let emittedDecimalPoint = false;
    let done = false;

    while (
        !done &&
        countSignificantDigits(
            result.match(/[.]$/) ? result.replace(".", "") : result
        ) < n
    ) {
        if (x === zero) {
            done = true;
        } else if (x < y) {
            if (emittedDecimalPoint) {
                x = x * ten;
                if (x < y) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            } else {
                emittedDecimalPoint = true;
                result = result + ".";
                x = x * ten;
                yield -1;
                if (x < y) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            }
        } else {
            let q = x / y;
            x = x % y;
            let qString = q.toString();
            result = result + qString;
            for (let i = 0; i < qString.length; i++) {
                yield parseInt(qString.charAt(i)) as Digit;
            }
        }
    }

    return 0;
}

export class Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
    readonly isNegative: boolean;

    constructor(p: bigint, q: bigint) {
        if (q === zero) {
            throw new RangeError(
                "Cannot construct rational whose denominator is zero"
            );
        }

        let num = p;
        let den = q;
        let neg = false;

        if (p < zero) {
            if (q < zero) {
                num = -p;
                den = -q;
            } else {
                num = -p;
                neg = true;
            }
        } else if (q < zero) {
            den = -q;
            neg = true;
        }

        let g = gcd(num, den);
        this.numerator = num / g;
        this.denominator = den / g;
        this.isNegative = neg;
    }

    public toString(): string {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${
            this.denominator
        }`;
    }

    private negate(): Rational {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }

        return new Rational(this.numerator * minusOne, this.denominator);
    }

    private reciprocal(): Rational {
        return new Rational(this.denominator, this.numerator);
    }

    private static _add(x: Rational, y: Rational): Rational {
        if (x.isNegative) {
            if (y.isNegative) {
                return Rational._add(x.negate(), y.negate()).negate();
            }

            return Rational._subtract(y, x.negate());
        }

        if (y.isNegative) {
            return Rational._subtract(x, y.negate());
        }

        return new Rational(
            x.numerator * y.denominator + y.numerator * x.denominator,
            x.denominator * y.denominator
        );
    }

    private static _subtract(x: Rational, y: Rational): Rational {
        if (x.isNegative) {
            if (y.isNegative) {
                return Rational.subtract(y.negate(), x.negate());
            }

            return Rational._add(x.negate(), y).negate();
        }

        if (y.isNegative) {
            return Rational._add(x, y.negate());
        }

        return new Rational(
            x.numerator * y.denominator - y.numerator * x.denominator,
            x.denominator * y.denominator
        );
    }

    private static _multiply(x: Rational, y: Rational): Rational {
        let neg = x.isNegative !== y.isNegative;
        return new Rational(
            (neg ? minusOne : one) * x.numerator * y.numerator,
            x.denominator * y.denominator
        );
    }

    private static _divide(x: Rational, y: Rational): Rational {
        return Rational._multiply(x, y.reciprocal());
    }

    public static add(...theArgs: Rational[]): Rational {
        return theArgs.reduce(
            (acc, cur) => Rational._add(acc, cur),
            new Rational(zero, one)
        );
    }

    public static subtract(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._subtract(acc, cur), x);
    }

    public static multiply(...theArgs: Rational[]): Rational {
        return theArgs.reduce(
            (acc, cur) => Rational._multiply(acc, cur),
            new Rational(one, one)
        );
    }

    public static divide(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._divide(acc, cur), x);
    }

    public toDecimalPlaces(n: number): string {
        if (!Number.isInteger(n)) {
            throw new TypeError(
                "Cannot round to non-integer number of decimal places"
            );
        }

        if (n < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        if (this.numerator === zero) {
            return "0";
        }

        let digitGenerator = nextDigitForDivision(
            this.numerator,
            this.denominator,
            n
        );
        let digit = digitGenerator.next();
        let result = "";
        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                result = ("" === result ? "0" : result) + ".";
            } else {
                result = result + `${v}`;
            }

            digit = digitGenerator.next();
        }

        return (this.isNegative ? "-" : "") + result;
    }
}

type CalculatorOperator = "+" | "-" | "*" | "/";
type CalculatorStackElement = CalculatorOperator | Rational;

export class RationalCalculator {
    private stack: CalculatorStackElement[] = [];

    add() {
        this.stack = this.stack.concat(["+"]);
        return this;
    }

    subtract() {
        this.stack = this.stack.concat(["-"]);
        return this;
    }

    multiply() {
        this.stack = this.stack.concat(["*"]);
        return this;
    }

    divide() {
        this.stack = this.stack.concat(["/"]);
        return this;
    }

    push(d: Rational | Rational[]) {
        this.stack = this.stack.concat(Array.isArray(d) ? d : [d]);
        return this;
    }

    evaluate(): Rational {
        let stack: Rational[] = [];

        while (this.stack.length > 0) {
            let element = this.stack.shift();
            if (element instanceof Rational) {
                stack.push(element);
            } else if ("+" === element) {
                if (0 === stack.length) {
                    throw new Error("Stack underflow in addition");
                }
                this.stack.unshift(Rational.add(...stack));
                stack = [];
            } else if ("-" === element) {
                if (0 === stack.length) {
                    throw new Error("Stack underflow in subtraction");
                }
                this.stack.unshift(
                    Rational.subtract(stack[0], ...stack.slice(1))
                );
                stack = [];
            } else if ("*" === element) {
                if (0 === stack.length) {
                    throw new Error("Stack underflow in multiplication");
                }
                this.stack.unshift(Rational.multiply(...stack));
                stack = [];
            } else if ("/" === element) {
                if (0 === stack.length) {
                    throw new Error("Stack underflow in division");
                }
                this.stack.unshift(
                    Rational.divide(stack[0], ...stack.slice(1))
                );
                stack = [];
            } else {
                throw new Error("Invalid stack element: " + element);
            }
        }

        if (0 === stack.length) {
            throw new Error("Empty stack");
        }

        if (1 < stack.length) {
            throw new Error("Local stack has multiple elements");
        }

        if (stack[0] instanceof Rational) {
            return stack[0];
        }

        throw new Error(`Invalid final stack element: ${stack[0]}`);
    }
}
