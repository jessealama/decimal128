import {
    countFractionalDigits,
    countSignificantDigits,
    Digit,
    ROUNDING_MODE_TRUNCATE,
    RoundingMode,
} from "./common.mjs";

const zero = BigInt(0);
const one = BigInt(1);
const minusOne = BigInt(-1);
const ten = BigInt(10);

function gcd(a: bigint, b: bigint): bigint {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function* nextDigitForDivision(
    x: bigint,
    y: bigint,
    n: number
): Generator<Digit> {
    let result = "";
    let emittedDecimalPoint = false;
    let done = false;

    while (!done && countFractionalDigits(result) < n) {
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
                result = (result === "" ? "0" : result) + ".";
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

function* nextSignificantDigitForDivision(
    x: bigint,
    y: bigint,
    n: number
): Generator<Digit> {
    let result = "";
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
                result = (result === "" ? "0" : result) + ".";
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

    public toExponential(): string {
        let p = this.isNegative ? "-" : "";
        return `${p}${this.numerator}e${this.denominator}`;
    }

    public static fromString(s: string): Rational {
        if (s.match(/^-/)) {
            return Rational.fromString(s.substring(1)).negate();
        }

        if (s.match(/^[0-9]+$/)) {
            return new Rational(BigInt(s), 1n);
        }

        if (s.match(/^[0-9]+[eE][+-]?[0-9]+$/)) {
            let [num, exp] = s.split(/[eE]/);
            let originalRat = new Rational(BigInt(num), 1n);
            return originalRat.scale10(Number(exp));
        }

        if (s.match(/[.]/)) {
            let [whole, decimal] = s.split(".");

            if (decimal.match(/[eE]/)) {
                let [dec, exp] = decimal.split(/[eE]/);
                let originalRat = Rational.fromString(`${whole}.${dec}`);
                return originalRat.scale10(Number(exp));
            }

            let numerator = BigInt(whole + decimal);
            let denominator = ten ** BigInt(decimal.length);
            return new Rational(numerator, denominator);
        }

        throw new SyntaxError(`Invalid rational number string: ${s}`);
    }

    public scale10(n: number): Rational {
        if (!Number.isInteger(n)) {
            throw new TypeError(
                "Cannot scale by non-integer number of decimal places"
            );
        }

        if (this.isNegative) {
            return this.negate().scale10(n).negate();
        }

        if (n === 0) {
            return this;
        }

        if (n < 0) {
            return new Rational(
                this.numerator,
                this.denominator * ten ** BigInt(0 - n)
            );
        }

        return new Rational(
            this.numerator * ten ** BigInt(n),
            this.denominator
        );
    }

    public isInteger(): boolean {
        return this.denominator === 1n;
    }

    public abs(): Rational {
        let num = this.numerator;
        let den = this.denominator;

        if (num < 0n) {
            return new Rational(-num, den);
        }

        return new Rational(num, den);
    }

    public negate(): Rational {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }

        return new Rational(this.numerator * minusOne, this.denominator);
    }

    private static _add(x: Rational, y: Rational): Rational {
        if (x.isNegative) {
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
            return Rational._add(x.negate(), y).negate();
        }

        return new Rational(
            x.numerator * y.denominator - y.numerator * x.denominator,
            x.denominator * y.denominator
        );
    }

    private static _multiply(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.numerator,
            x.denominator * y.denominator
        );
    }

    private static _divide(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.denominator,
            x.denominator * y.numerator
        );
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

    public toFixed(n: number): string {
        if (n !== Infinity && !Number.isInteger(n)) {
            throw new TypeError(
                "Cannot enumerate a non-integer number of decimal places"
            );
        }

        if (n < 0) {
            throw new RangeError(
                "Cannot enumerate a negative number of decimal places"
            );
        }

        if (this.isNegative) {
            return "-" + this.negate().toFixed(n);
        }

        if (this.numerator === zero) {
            if (n === 0) {
                return "0";
            }

            return "0" + "." + "0".repeat(n);
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

        if (Infinity === n) {
            return result;
        }

        let numFractionalDigits = countFractionalDigits(result);

        if (numFractionalDigits >= n) {
            return result;
        }

        let numZeroesNeeded = n - numFractionalDigits;
        let zeroesNeeded = "0".repeat(numZeroesNeeded);

        if (result.match(/[.]/)) {
            return result + zeroesNeeded;
        }

        return result + "." + zeroesNeeded;
    }

    public toPrecision(n: number): string {
        if (!Number.isInteger(n)) {
            throw new TypeError(
                "Cannot enumerate a non-integer number of significant digits"
            );
        }

        if (n < 0) {
            throw new RangeError(
                "Cannot enumerate a negative number of significant places"
            );
        }

        if (this.numerator === zero) {
            return "0" + "." + "0".repeat(n - 1);
        }

        let digitGenerator = nextSignificantDigitForDivision(
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

    round(numFractionalDigits: number, mode: RoundingMode): Rational {
        if (!Number.isInteger(numFractionalDigits)) {
            throw new TypeError(
                "Cannot round to non-integer number of decimal places"
            );
        }

        if (numFractionalDigits < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        if (numFractionalDigits > 1) {
            return this.scale10(1)
                .round(numFractionalDigits - 1, mode)
                .scale10(-1);
        }
        let s = this.toFixed(1);

        let [integerPart, fractionalPart] = s.split(".");

        if (mode === ROUNDING_MODE_TRUNCATE) {
            return Rational.fromString(integerPart);
        }

        let penultimateDigit = parseInt(
            integerPart.charAt(integerPart.length - 1)
        ) as Digit;
        let finalDigit = parseInt(fractionalPart.charAt(0)) as Digit;

        if (finalDigit < 5) {
            return Rational.fromString(integerPart);
        }

        if (finalDigit > 5) {
            return Rational.add(
                Rational.fromString(integerPart),
                Rational.fromString("1")
            );
        }

        if (penultimateDigit % 2 === 0) {
            return Rational.fromString(integerPart);
        }

        return Rational.add(
            Rational.fromString(integerPart),
            Rational.fromString("1")
        );
    }

    cmp(x: Rational): -1 | 0 | 1 {
        let a =
            (this.isNegative ? minusOne : one) * this.numerator * x.denominator;
        let b =
            (x.isNegative ? minusOne : one) * x.numerator * this.denominator;

        if (a < b) {
            return -1;
        }

        if (b < a) {
            return 1;
        }

        return 0;
    }

    lessThan(x: Rational): boolean {
        return this.cmp(x) === -1;
    }

    equals(x: Rational): boolean {
        return this.cmp(x) === 0;
    }

    isZero(): boolean {
        return this.numerator === zero;
    }
}
