import BigNumber from "bignumber.js";

/**
 * decimal128.js -- Decimal128 implementation in JavaScript
 *
 * The purpose of this module is to provide a userland implementation of
 * IEEE 758 Decimal128, which are exact decimal floating point numbers fit into
 * 128 bits. This library provides basic arithmetic operations (addition, multiplication).
 * It's main purpose is to help gather data and experience about using Decimal128
 * in JavaScript programs. Speed is not a concern; the main goal is to simply
 * make Decimal128 values available in some form in JavaScript. In the future,
 * JavaScript may get exact decimal numbers as a built-in data type, which will
 * surely be much faster than what this library can provide.
 *
 * @author Jesse Alama <jesse@igalia.com>
 */

const scaleMin = -6143;
const scaleMax = 6144;
const maxSigDigits = 34;
const DIGITS_E = "2.718281828459045235360287471352662";

/**
 * Normalize a digit string. This means:
 *
 * + removing any initial zeros
 * + removing any trailing zeros
 *
 * @param s A digit string
 *
 * @example normalize("000123.456000") // => "123.456"
 * @example normalize("000000.000000") // => "0"
 * @example normalize("000000.000001") // => "0.000001"
 * @example normalize("000000.100000") // => "0.1"
 */
function normalize(s: string): string {
    let minus = !!s.match(/^-/);
    let a = minus ? s.replace(/^-0+/, "-") : s.replace(/^0+/, "");
    let b = a.match(/[.]/) ? a.replace(/0+$/, "") : a;
    if (b.match(/^[.]/)) {
        b = "0" + b;
    }
    if (b.match(/[.]$/)) {
        b = b.substring(0, b.length - 1);
    }
    if ("-" === b || "" === b) {
        b = "0";
    }
    return b;
}

/**
 * Return the significand of a digit string, assumed to be normalized.
 * The returned value is a digit string that has no decimal point, even if the original
 * digit string had one.
 *
 * @param s
 *
 * @example significand("123.456") // => "123456"
 * @example significand("0.000123") // => "123"
 */
function significand(s: string): string {
    if (s.match(/^-/)) {
        return significand(s.substring(1));
    } else if (s.match(/^0[.]/)) {
        return significand(s.substring(2));
    } else if (s.match(/[.]/)) {
        return significand(s.replace(/[.]/, ""));
    } else if (s.match(/^0+/)) {
        return significand(s.replace(/^0+/, ""));
    } else if (s.match(/0+$/)) {
        return significand(s.replace(/0+$/, ""));
    } else {
        return s;
    }
}

/**
 * Return the scale of a digit string, assumed to be normalized.
 *
 * Return an integer in all cases except one: if the digit string is zero, return undefined.
 *
 * @param s
 *
 * @example scale("123.456") // => 3
 * @example scale("0.000123") // => -3
 * @example scale("0.000000") // => undefined
 * @example scale("0.000001") // => -6
 */
function scale(s: string): number | undefined {
    if (s.match(/^-/)) {
        return scale(s.substring(1));
    } else if (s.match(/^0[.]/)) {
        return 0 - scale(s.substring(2));
    } else if (s.match(/[.]/)) {
        let [lhs] = s.split(".");
        return lhs.length;
    } else if ("0" === s) {
        return undefined;
    } else {
        return s.length;
    }
}

export class Decimal128 {
    public static E = new Decimal128(DIGITS_E);
    public readonly significand: string;
    public readonly scale: number | undefined;
    public readonly isNegative: boolean;
    private readonly b: BigNumber;
    private readonly digitStrRegExp = /^-?[0-9]+([.][0-9]+)?$/;

    constructor(n: string) {
        if (!n.match(this.digitStrRegExp)) {
            throw new SyntaxError(`Illegal number format "${n}"`);
        }

        this.isNegative = !!n.match(/^-/);

        let normalized = normalize(n);

        let sg = significand(normalized);
        let sc = scale(normalized);
        let isInteger = !!normalized.match(/^[0-9]+$/);

        let numSigDigits = sg.length;

        if (isInteger && numSigDigits > maxSigDigits) {
            throw new RangeError("Integer too large");
        }

        if (numSigDigits > maxSigDigits) {
            let finalDigit = parseInt(sg.charAt(maxSigDigits));
            if (finalDigit >= 5) {
                sg = sg.substring(0, maxSigDigits - 1) + `${finalDigit + 1}`;
            } else {
                sg = sg.substring(0, maxSigDigits);
            }
        }

        if (sc > scaleMax) {
            throw new RangeError(`Scale too big (${sc})`);
        }

        if (sc < scaleMin) {
            throw new RangeError(`Scale too small (${sc})`);
        }

        this.significand = sg;
        this.scale = sc;
        this.b = new BigNumber(normalized);
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        return normalize(this.b.toFixed());
    }

    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    isInteger(): boolean {
        return this.b.isInteger();
    }

    /**
     * Is this Decimal128 zero?
     */
    isZero(): boolean {
        return this.b.isZero();
    }

    /**
     * Are these two Decimal1288 values equal?
     *
     * @param x
     */
    equals(x: Decimal128): boolean {
        return this.b.isEqualTo(x.b);
    }

    /**
     * Add this Decimal128 value to another.
     * @param x
     */
    add(x: Decimal128): Decimal128 {
        return Decimal128.toDecimal128(this.b.plus(x.b));
    }

    /**
     * Subtract another Decimal128 value from this one.
     *
     * @param x
     */
    subtract(x: Decimal128): Decimal128 {
        return Decimal128.toDecimal128(this.b.minus(x.b));
    }

    /**
     * Multiply this Decimal128 value by another.
     *
     * @param x
     */
    multiply(x: Decimal128): Decimal128 {
        return Decimal128.toDecimal128(this.b.multipliedBy(x.b));
    }

    /**
     * Divide this Decimal128 value by another.
     *
     * Throws a RangeError if the divisor is zero.
     *
     * @param x
     */
    divide(x: Decimal128): Decimal128 {
        if (x.b.isZero()) {
            throw new RangeError("Cannot divide by zero");
        }

        return Decimal128.toDecimal128(this.b.dividedBy(x.b));
    }

    /**
     * Return the absolute value of this Decimal128 value.
     */
    abs(): Decimal128 {
        return Decimal128.toDecimal128(this.b.absoluteValue());
    }

    /**
     * Raise this number to the power of another
     *
     * @param x Should be an integer (in the sense of isInteger)
     * @throws RangeError If we try to raise zero to a negative power
     * @throws RangeError If we try to raise to a non-integer power
     */
    exp(x: Decimal128): Decimal128 {
        if (this.isZero() && x.isNegative) {
            throw new RangeError("Cannot raise zero to negative power");
        }

        if (x.isInteger()) {
            return Decimal128.toDecimal128(this.b.exponentiatedBy(x.b));
        }

        throw new RangeError("Cannot raise to non-integer power");
    }

    /**
     * Return a digit string where the digits of this number are cut off after
     * a certain number of digits. Rounding may be performed, in case we always round up.
     *
     * @param n
     */
    toDecimalPlaces(n: number): Decimal128 {
        if (!Number.isInteger(n)) {
            throw new TypeError("Argument must be an integer");
        }

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        return new Decimal128(this.b.toFixed(n));
    }

    /**
     * Return the ceiling of this number. That is: the smallest integer greater than or equal to this number.
     */
    ceil(): Decimal128 {
        if (this.isInteger()) {
            return this;
        }

        return this.truncate().add(
            new Decimal128(this.isNegative ? "-1" : "1")
        );
    }

    /**
     * Return the floor of this number. That is: the largest integer less than or equal to this number.
     */
    floor(): Decimal128 {
        return this.truncate();
    }

    /**
     * Compare two values. Return
     *
     * + -1 if this value is strictly less than the other,
     * + 0 if they are equal, and
     * + 1 otherwise.
     *
     * @param x
     */
    cmp(x: Decimal128): number {
        return this.b.comparedTo(x.b);
    }

    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    truncate(): Decimal128 {
        return new Decimal128(this.b.integerValue().toString());
    }

    /**
     * Convert a BigNumber to a Decimal128.
     *
     * @param x
     * @private
     */
    private static toDecimal128(x: BigNumber): Decimal128 {
        return new Decimal128(x.toFixed());
    }
}
