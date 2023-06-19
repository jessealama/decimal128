const zero = BigInt(0);
function gcd(a, b) {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
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
        this.numerator = p / g;
        this.denominator = q / g;
        this.isNegative = neg;
    }
    toString() {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${this.denominator}`;
    }
    static _add(x, y) {
        return new Rational(x.numerator * y.denominator + y.numerator * x.denominator, x.denominator * y.denominator);
    }
    static _subtract(x, y) {
        return new Rational(x.numerator * y.denominator - y.numerator * x.denominator, x.denominator * y.denominator);
    }
    static _multiply(x, y) {
        return new Rational(x.numerator * y.numerator, x.denominator * y.denominator);
    }
    static _divide(x, y) {
        return new Rational(x.numerator * y.denominator, x.denominator * y.numerator);
    }
    static add(x, ...theArgs) {
        let sum = x;
        for (let i = 0; i < theArgs.length; i++) {
            sum = Rational._add(sum, theArgs[i]);
        }
        return sum;
    }
    static subtract(x, ...theArgs) {
        let diff = x;
        for (let i = 0; i < theArgs.length; i++) {
            diff = Rational._subtract(diff, theArgs[i]);
        }
        return diff;
    }
    static multiply(x, ...theArgs) {
        let prod = x;
        for (let i = 0; i < theArgs.length; i++) {
            prod = Rational._multiply(prod, theArgs[i]);
        }
        return prod;
    }
    static divide(x, ...theArgs) {
        let quot = x;
        for (let i = 0; i < theArgs.length; i++) {
            quot = Rational._divide(quot, theArgs[i]);
        }
        return quot;
    }
    negate() {
        return new Rational(-this.numerator, this.denominator);
    }
    toDecimalPlaces(n) {
        if (!Number.isInteger(n)) {
            throw new TypeError("Cannot round to non-integer number of decimal places");
        }
        if (n < 0) {
            throw new RangeError("Cannot round to negative number of decimal places");
        }
        throw new Error("Not implemented");
    }
}
