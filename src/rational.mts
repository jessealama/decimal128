import JSBI from "jsbi";
import { countSignificantDigits, Digit } from "./common.mjs";

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

    while (
        !done &&
        countSignificantDigits(
            result.match(/[.]$/) ? result.replace(".", "") : result
        ) < n
    ) {
        if (JSBI.equal(x, zero)) {
            done = true;
        } else if (JSBI.lessThan(x, y)) {
            if (emittedDecimalPoint) {
                x = JSBI.multiply(x, ten);
                if (JSBI.lessThan(x, y)) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            } else {
                emittedDecimalPoint = true;
                result = (result === "" ? "0" : result) + ".";
                x = JSBI.multiply(x, ten);
                yield -1;
                if (JSBI.lessThan(x, y)) {
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

        if (JSBI.lessThan(p, zero)) {
            if (JSBI.lessThan(q, zero)) {
                num = JSBI.unaryMinus(p);
                den = JSBI.unaryMinus(q);
            } else {
                num = JSBI.unaryMinus(p);
                neg = true;
            }
        } else if (JSBI.lessThan(q, zero)) {
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

    private negate(): Rational {
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

        if (JSBI.equal(this.numerator, zero)) {
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

    cmp(x: Rational): -1 | 0 | 1 {
        let a = JSBI.multiply(
            JSBI.multiply(this.isNegative ? minusOne : one, this.numerator),
            x.denominator
        );
        let b = JSBI.multiply(
            JSBI.multiply(x.isNegative ? minusOne : one, x.numerator),
            this.denominator
        );

        if (JSBI.lessThan(a, b)) {
            return -1;
        }

        if (JSBI.lessThan(b, a)) {
            return 1;
        }

        return 0;
    }
}
