import JSBI from "jsbi";

import {
    countFractionalDigits,
    Digit,
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_HALF_EXPAND,
    ROUNDING_MODE_TRUNCATE,
    RoundingMode,
} from "./common.mjs";

const zero = JSBI.BigInt(0);
const one = JSBI.BigInt(1);
const minusOne = JSBI.BigInt(-1);
const ten = JSBI.BigInt(10);

function gcd(a: JSBI, b: JSBI): JSBI {
    while (JSBI.notEqual(b, zero)) {
        let t = b;
        b = JSBI.remainder(a, b);
        a = t;
    }
    return a;
}

function* nextDigitForDivision(x: JSBI, y: JSBI, n: number): Generator<Digit> {
    let result = "";
    let emittedDecimalPoint = false;
    let done = false;

    while (!done && countFractionalDigits(result) < n) {
        if (JSBI.equal(x, zero)) {
            done = true;
        } else if (JSBI.LT(x, y)) {
            if (emittedDecimalPoint) {
                x = JSBI.multiply(x, ten);
                if (JSBI.LT(x, y)) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            } else {
                emittedDecimalPoint = true;
                result = (result === "" ? "0" : result) + ".";
                x = JSBI.multiply(x, ten);
                yield -1;
                if (JSBI.LT(x, y)) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            }
        } else {
            let q = JSBI.divide(x, y);
            x = JSBI.remainder(x, y);
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
    readonly numerator: JSBI;
    readonly denominator: JSBI;
    readonly isNegative: boolean;

    constructor(p: JSBI, q: JSBI) {
        if (JSBI.equal(q, zero)) {
            throw new RangeError(
                "Cannot construct rational whose denominator is zero"
            );
        }

        let num = p;
        let den = q;
        let neg = false;

        if (JSBI.LT(p, zero)) {
            if (JSBI.LT(q, zero)) {
                num = JSBI.unaryMinus(p);
                den = JSBI.unaryMinus(q);
            } else {
                num = JSBI.unaryMinus(p);
                neg = true;
            }
        } else if (JSBI.LT(q, zero)) {
            den = JSBI.unaryMinus(q);
            neg = true;
        }

        let g = gcd(num, den);
        this.numerator = JSBI.divide(num, g);
        this.denominator = JSBI.divide(den, g);
        this.isNegative = neg;
    }

    public toString(): string {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${
            this.denominator
        }`;
    }

    public static fromString(s: string): Rational {
        if (s.match(/^-/)) {
            return Rational.fromString(s.substring(1)).negate();
        }

        if (s.match(/^[0-9]+$/)) {
            return new Rational(JSBI.BigInt(s), JSBI.BigInt(1));
        }

        if (s.match(/^[0-9]+[eE][+-]?[0-9]+$/)) {
            let [num, exp] = s.split(/[eE]/);
            let originalRat = new Rational(JSBI.BigInt(num), JSBI.BigInt(1));
            return originalRat.scale10(Number(exp));
        }

        if (s.match(/[.]/)) {
            let [whole, decimal] = s.split(".");

            if (decimal.match(/[eE]/)) {
                let [dec, exp] = decimal.split(/[eE]/);
                let originalRat = Rational.fromString(`${whole}.${dec}`);
                return originalRat.scale10(Number(exp));
            }

            let numerator = JSBI.BigInt(whole + decimal);
            let denominator = JSBI.exponentiate(
                ten,
                JSBI.BigInt(decimal.length)
            );
            return new Rational(numerator, denominator);
        }

        throw new SyntaxError(`Invalid rational number string: ${s}`);
    }

    public scale10(n: number): Rational {
        if (this.isNegative) {
            return this.negate().scale10(n).negate();
        }

        if (n === 0) {
            return this;
        }

        if (n < 0) {
            return new Rational(
                this.numerator,
                JSBI.multiply(
                    this.denominator,
                    JSBI.exponentiate(ten, JSBI.BigInt(0 - n))
                )
            );
        }

        return new Rational(
            JSBI.multiply(
                this.numerator,
                JSBI.exponentiate(ten, JSBI.BigInt(n))
            ),
            this.denominator
        );
    }

    public negate(): Rational {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }

        return new Rational(
            JSBI.multiply(this.numerator, minusOne),
            this.denominator
        );
    }

    private static _add(x: Rational, y: Rational): Rational {
        if (x.isNegative) {
            return Rational._subtract(y, x.negate());
        }

        if (y.isNegative) {
            return Rational._subtract(x, y.negate());
        }

        return new Rational(
            JSBI.add(
                JSBI.multiply(x.numerator, y.denominator),
                JSBI.multiply(y.numerator, x.denominator)
            ),
            JSBI.multiply(x.denominator, y.denominator)
        );
    }

    private static _subtract(x: Rational, y: Rational): Rational {
        if (x.isNegative) {
            return Rational._add(x.negate(), y).negate();
        }

        return new Rational(
            JSBI.subtract(
                JSBI.multiply(x.numerator, y.denominator),
                JSBI.multiply(y.numerator, x.denominator)
            ),
            JSBI.multiply(x.denominator, y.denominator)
        );
    }

    private static _multiply(x: Rational, y: Rational): Rational {
        return new Rational(
            JSBI.multiply(x.numerator, y.numerator),
            JSBI.multiply(x.denominator, y.denominator)
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

        if (JSBI.equal(this.numerator, zero)) {
            if (Infinity === n) {
                throw new RangeError(
                    "Cannot enumerate infinite decimal places of zero"
                );
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

    private static roundHalfEven(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (finalDigit < 5) {
            return initialPart;
        }

        if (finalDigit > 5) {
            return Rational.add(
                initialPart,
                initialPart.isNegative ? quantum.negate() : quantum
            );
        }

        if (penultimateDigit % 2 === 0) {
            return initialPart;
        }

        return Rational.add(
            initialPart,
            initialPart.isNegative ? quantum.negate() : quantum
        );
    }

    private static roundHalfExpand(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (finalDigit < 5) {
            return initialPart;
        }

        return Rational.add(
            initialPart,
            initialPart.isNegative ? quantum.negate() : quantum
        );
    }

    private static roundCeil(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (initialPart.isNegative) {
            return initialPart;
        }

        if (finalDigit === 0) {
            return initialPart;
        }

        return Rational.add(initialPart, quantum);
    }

    private static roundFloor(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (initialPart.isNegative) {
            return Rational.subtract(initialPart, quantum);
        }

        return initialPart;
    }

    round(numFractionalDigits: number, mode: RoundingMode): Rational {
        if (numFractionalDigits < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        let s = this.toFixed(numFractionalDigits + 1);

        let [integerPart, fractionalPart] = s.split(".");

        let quantum = Rational.fromString(
            numFractionalDigits === 0
                ? "1"
                : "0" + "." + "0".repeat(numFractionalDigits - 1) + "1"
        );
        let truncated = Rational.fromString(
            integerPart + "." + fractionalPart.substring(0, numFractionalDigits)
        );

        let penultimateDigit = parseInt(
            numFractionalDigits === 0
                ? integerPart.charAt(integerPart.length - 1)
                : fractionalPart.charAt(numFractionalDigits - 1)
        ) as Digit;
        let finalDigit = parseInt(
            fractionalPart.charAt(numFractionalDigits)
        ) as Digit;

        if (mode === ROUNDING_MODE_TRUNCATE) {
            return truncated;
        }

        if (mode === ROUNDING_MODE_HALF_EVEN) {
            return Rational.roundHalfEven(
                truncated,
                penultimateDigit,
                finalDigit,
                quantum
            );
        }

        if (mode === ROUNDING_MODE_CEILING) {
            return Rational.roundCeil(
                truncated,
                penultimateDigit,
                finalDigit,
                quantum
            );
        }

        if (mode === ROUNDING_MODE_FLOOR) {
            return Rational.roundFloor(
                truncated,
                penultimateDigit,
                finalDigit,
                quantum
            );
        }

        return Rational.roundHalfExpand(
            truncated,
            penultimateDigit,
            finalDigit,
            quantum
        );
    }

    cmp(x: Rational): -1 | 0 | 1 {
        let a = JSBI.multiply(
            JSBI.multiply(this.isNegative ? minusOne : one, this.numerator),
            x.denominator
        );
        let b = JSBI.multiply(
            JSBI.multiply(x.isNegative ? minusOne : one, x.numerator),
            this.denominator
        );

        if (JSBI.LT(a, b)) {
            return -1;
        }

        if (JSBI.LT(b, a)) {
            return 1;
        }

        return 0;
    }

    isZero(): boolean {
        return JSBI.equal(this.numerator, zero);
    }
}
