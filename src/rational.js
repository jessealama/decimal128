import { countSignificantDigits } from "./common";
const zero = BigInt(0);
const one = BigInt(1);
const minusOne = BigInt(-1);
const ten = BigInt(10);
function gcd(a, b) {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}
function* nextDigitForDivision(x, y, n) {
    let result = "";
    let emittedDecimalPoint = false;
    let done = false;
    while (!done &&
        countSignificantDigits(result.match(/[.]$/) ? result.replace(".", "") : result) < n) {
        if (x === zero) {
            done = true;
        }
        else if (x < y) {
            if (emittedDecimalPoint) {
                x = x * ten;
                if (x < y) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            }
            else {
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
        }
        else {
            let q = x / y;
            x = x % y;
            let qString = q.toString();
            result = result + qString;
            for (let i = 0; i < qString.length; i++) {
                yield parseInt(qString.charAt(i));
            }
        }
    }
    return 0;
}
export class Rational {
    constructor(p, q) {
        if (q === zero) {
            throw new RangeError("Cannot construct rational whose denominator is zero");
        }
        let num = p;
        let den = q;
        let neg = false;
        if (p < zero) {
            if (q < zero) {
                num = -p;
                den = -q;
            }
            else {
                num = -p;
                neg = true;
            }
        }
        else if (q < zero) {
            den = -q;
            neg = true;
        }
        let g = gcd(num, den);
        this.numerator = num / g;
        this.denominator = den / g;
        this.isNegative = neg;
    }
    toString() {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${this.denominator}`;
    }
    negate() {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }
        return new Rational(this.numerator * minusOne, this.denominator);
    }
    reciprocal() {
        return new Rational(this.denominator, this.numerator);
    }
    static _add(x, y) {
        if (x.isNegative) {
            if (y.isNegative) {
                return Rational._add(x.negate(), y.negate()).negate();
            }
            return Rational._subtract(y, x.negate());
        }
        if (y.isNegative) {
            return Rational._subtract(x, y.negate());
        }
        return new Rational(x.numerator * y.denominator + y.numerator * x.denominator, x.denominator * y.denominator);
    }
    static _subtract(x, y) {
        if (x.isNegative) {
            if (y.isNegative) {
                return Rational.subtract(y.negate(), x.negate());
            }
            return Rational._add(x.negate(), y).negate();
        }
        if (y.isNegative) {
            return Rational._add(x, y.negate());
        }
        return new Rational(x.numerator * y.denominator - y.numerator * x.denominator, x.denominator * y.denominator);
    }
    static _multiply(x, y) {
        let neg = x.isNegative !== y.isNegative;
        return new Rational((neg ? minusOne : one) * x.numerator * y.numerator, x.denominator * y.denominator);
    }
    static _divide(x, y) {
        return Rational._multiply(x, y.reciprocal());
    }
    static add(...theArgs) {
        return theArgs.reduce((acc, cur) => Rational._add(acc, cur), new Rational(zero, one));
    }
    static subtract(x, ...theArgs) {
        return theArgs.reduce((acc, cur) => Rational._subtract(acc, cur), x);
    }
    static multiply(...theArgs) {
        return theArgs.reduce((acc, cur) => Rational._multiply(acc, cur), new Rational(one, one));
    }
    static divide(x, ...theArgs) {
        return theArgs.reduce((acc, cur) => Rational._divide(acc, cur), x);
    }
    toDecimalPlaces(n) {
        if (!Number.isInteger(n)) {
            throw new TypeError("Cannot round to non-integer number of decimal places");
        }
        if (n < 0) {
            throw new RangeError("Cannot round to negative number of decimal places");
        }
        if (this.numerator === zero) {
            return "0";
        }
        let digitGenerator = nextDigitForDivision(this.numerator, this.denominator, n);
        let digit = digitGenerator.next();
        let result = "";
        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                result = ("" === result ? "0" : result) + ".";
            }
            else {
                result = result + `${v}`;
            }
            digit = digitGenerator.next();
        }
        return (this.isNegative ? "-" : "") + result;
    }
    cmp(x) {
        let a = (this.isNegative ? minusOne : one) * this.numerator * x.denominator;
        let b = (x.isNegative ? minusOne : one) * x.numerator * this.denominator;
        if (a < b) {
            return -1;
        }
        if (b < a) {
            return 1;
        }
        return 0;
    }
}
