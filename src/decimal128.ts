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

import { Rational } from "./rational";

const EXPONENT_MIN = -6143;
const EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

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
    if (s.match(/^-/)) {
        let n = normalize(s.substring(1));
        if ("0" === n) {
            return "0";
        }
        return "-" + n;
    }
    let a = s.replace(/^0+/, "");
    let b = a.match(/[.]/) ? a.replace(/0+$/, "") : a;
    if (b.match(/^[.]/)) {
        b = "0" + b;
    }
    if (b.match(/[.]$/)) {
        b = b.substring(0, b.length - 1);
    }
    if ("" === b) {
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
 * Counts the number of significant digits in a digit string, assumed to be normalized.
 *
 * @param s
 */
function countSignificantDigits(s: string): number {
    if (s.match(/^-/)) {
        return countSignificantDigits(s.substring(1));
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

/**
 * Get the n-th significant digit of a digit string, assumed to be normalized.
 *
 * @param s digit string (assumed to be normalized)
 * @param n non-negative integer
 */
function nthSignificantDigit(s: string, n: number): number {
    return parseInt(significand(s).charAt(n));
}

function propogateCarryFromRight(s: string): string {
    let [left, right] = s.split(/[.]/);

    if (undefined === right) {
        let lastDigit = parseInt(left.charAt(left.length - 1));
        if (lastDigit === 9) {
            if (1 === left.length) {
                return "10";
            }

            return (
                propogateCarryFromRight(left.substring(0, left.length - 1)) +
                "0"
            );
        }
        return left.substring(0, left.length - 1) + `${lastDigit + 1}`;
    }

    let m = right.match(/^0*[1-9]/);

    if (null === m) {
        return s;
    }

    let digits = m[0];

    let len = digits.length;

    if (1 === len) {
        let lastDigit = parseInt(right.charAt(0));
        if (9 === lastDigit) {
            return propogateCarryFromRight(left);
        }
        return left + "." + `${lastDigit + 1}`;
    } else {
        return (
            left +
            "." +
            right.substring(0, len - 1) +
            `${parseInt(right.charAt(len - 1)) + 1}`
        );
    }
}

function maybeRoundAfterNSignificantDigits(s: string, n: number): string {
    if (s.match(/^-/)) {
        return "-" + maybeRoundAfterNSignificantDigits(s.substring(1), n);
    }

    if (n < 1) {
        return propogateCarryFromRight(s);
    }

    let finalDigit = nthSignificantDigit(s, n - 1);
    let decidingDigit = nthSignificantDigit(s, n);

    if (decidingDigit >= 5) {
        if (9 === finalDigit) {
            let cutoff = cutoffAfterSignificantDigits(s, n);
            return maybeRoundAfterNSignificantDigits(cutoff, n - 1);
        }

        return cutoffAfterSignificantDigits(s, n - 1) + `${finalDigit + 1}`;
    }

    return cutoffAfterSignificantDigits(s, n);
}

function cutoffAfterSignificantDigits(s: string, n: number): string {
    if (s.match(/^0[.]/)) {
        let m = s.match(/^0[.]0+/);

        if (m) {
            return (
                m[0] + cutoffAfterSignificantDigits(s.substring(m[0].length), n)
            );
        }

        return s.substring(0, n + 2);
    }

    if (s.match(/[.]/)) {
        let newS = s.substring(0, n + 1);
        if (newS.match(/[.]$/)) {
            return newS.substring(0, newS.length - 1);
        } else {
            return newS;
        }
    }

    return s.substring(0, n);
}

function ensureDecimalPoint(s: string): string {
    if (s.match(/[.]/)) {
        return s;
    } else {
        return s + ".0";
    }
}

/**
 * Given two digit strings, return a pair of digit strings where
 *
 * + the number of digits before the decimal point is the same
 * + the number of digits after the decimal point is the same
 *
 * This means that one of the strings may have some zeros prepended to it,
 * and possibly prepended to it.
 *
 * It is assumed that both digits are non-negative.
 *
 * @example padDigits("123.456", "9.9") // => ["123.456", "009.900"]
 * @example padDigits("123.456", "9.99") // => ["123.456", "009.990"]
 *
 * @param s1
 * @param s2
 */
function padDigits(s1: string, s2: string): [string, string] {
    let [lhs1, rhs1] = ensureDecimalPoint(s1).split(".");
    let [lhs2, rhs2] = ensureDecimalPoint(s2).split(".");

    let numIntegerDigits1 = lhs1.length;
    let numIntegerDigits2 = lhs2.length;
    let numDecimalDigits1 = rhs1.length;
    let numDecimalDigits2 = rhs2.length;

    let result1 = `${lhs1}.${rhs1}`;
    let result2 = `${lhs2}.${rhs2}`;

    if (numIntegerDigits1 < numIntegerDigits2) {
        result1 = "0".repeat(numIntegerDigits2 - numIntegerDigits1) + result1;
    } else {
        result2 = "0".repeat(numIntegerDigits1 - numIntegerDigits2) + result2;
    }

    if (numDecimalDigits1 < numDecimalDigits2) {
        result1 = result1 + "0".repeat(numDecimalDigits2 - numDecimalDigits1);
    } else {
        result2 = result2 + "0".repeat(numDecimalDigits1 - numDecimalDigits2);
    }

    return [result1, result2];
}

/**
 * Return the exponent of a digit string, assumed to be normalized. It is the number of digits
 * to the left or right that the significand needs to be shifted to recover the original (normalized)
 * digit string.
 *
 * @param s string of digits (assumed to be normalized)
 */
function exponent(s: string): number | undefined {
    if (s.match(/^-/)) {
        return exponent(s.substring(1));
    } else if (s.match(/[.]/)) {
        let rhs = s.split(".")[1];
        return 0 - rhs.length;
    } else if (s === "0") {
        return 0;
    } else if (s.match(/0+$/)) {
        let m = s.match(/0+$/);
        if (m) {
            return m[0].length;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

interface Decimal128Constructor {
    significand: string;
    exponent: bigint;
    isNegative: boolean;
}

function isInteger(x: Decimal128Constructor): boolean {
    if (x.exponent >= BigInt(0)) {
        return true;
    }

    let numDigits = x.significand.length;

    return BigInt(numDigits) + x.exponent >= 0;
}

function validateConstructorData(x: Decimal128Constructor): void {
    let numSigDigits = countSignificantDigits(x.significand);

    if (isInteger(x) && numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        throw new RangeError("Integer too large");
    }

    if (x.exponent > EXPONENT_MAX) {
        throw new RangeError(`Exponent too big (${exponent})`);
    }

    if (x.exponent < EXPONENT_MIN) {
        throw new RangeError(`Exponent too small (${exponent})`);
    }
}

function handleExponentialNotation(s: string): Decimal128Constructor {
    let [sg, exp] = s.match(/e/) ? s.split("e") : s.split("E");

    let isNegative = false;
    if (sg.match(/^-/)) {
        isNegative = true;
        sg = sg.substring(1);
    }

    return {
        significand: sg,
        exponent: BigInt(exp),
        isNegative: isNegative,
    };
}

function handleDecimalNotation(s: string): Decimal128Constructor {
    let normalized = normalize(s.replace(/_/g, ""));
    let isNegative = !!normalized.match(/^-/);
    let sg = significand(normalized);
    let exp = exponent(normalized);
    let numSigDigits = countSignificantDigits(normalized);
    let isInteger = typeof exp === "number" ? exp >= 0 : false;

    if (!isInteger && numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        let rounded = maybeRoundAfterNSignificantDigits(
            normalized,
            MAX_SIGNIFICANT_DIGITS
        );
        return handleDecimalNotation(rounded);
    }

    return {
        significand: sg,
        exponent: BigInt(typeof exp === "number" ? exp : 0),
        isNegative: isNegative,
    };
}

export class Decimal128 {
    public readonly significand: string;
    public readonly exponent: number;
    public readonly isNegative: boolean;
    private readonly digitStrRegExp =
        /^-?[0-9]+(?:_?[0-9]+)*(?:[.][0-9](_?[0-9]+)*)?$/;
    private readonly exponentRegExp = /^-?[1-9][0-9]*[eE]-?[1-9][0-9]*$/;
    private readonly rat;

    constructor(s: string) {
        let data = undefined;

        if (s.match(this.exponentRegExp)) {
            data = handleExponentialNotation(s);
        } else if (s.match(this.digitStrRegExp)) {
            data = handleDecimalNotation(s);
        } else {
            throw new SyntaxError(`Illegal number format "${s}"`);
        }

        validateConstructorData(data);

        this.significand = data.significand;
        this.exponent = parseInt(data.exponent.toString()); // safe because the min & max are less than 10000
        this.isNegative = data.isNegative;

        if ("1" === this.significand) {
            // power of ten
            if (this.exponent < 0) {
                this.rat = new Rational(
                    BigInt(1),
                    BigInt(
                        (this.isNegative ? "-" : "") +
                            "1" +
                            "0".repeat(0 - this.exponent)
                    )
                );
            } else if (this.exponent === 0) {
                this.rat = new Rational(
                    BigInt(this.isNegative ? -1 : 1),
                    BigInt(1)
                );
            } else {
                this.rat = new Rational(
                    BigInt(
                        (this.isNegative ? "-" : "") +
                            "1" +
                            "0".repeat(this.exponent)
                    ),
                    BigInt(1)
                );
            }
        } else if (this.exponent < 0) {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand),
                BigInt(10) ** BigInt(0 - this.exponent)
            );
        } else if (this.exponent === 1) {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand),
                BigInt(1)
            );
        } else {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand),
                BigInt(10) ** BigInt(this.exponent)
            );
        }
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        let prefix = this.isNegative ? "-" : "";

        if (this.exponent === 0) {
            return prefix + ("" === this.significand ? "0" : this.significand);
        }

        if (this.exponent > 0) {
            return prefix + this.significand + "0".repeat(this.exponent);
        }

        if (this.significand.length === -this.exponent) {
            return prefix + "0." + this.significand;
        }

        if (this.significand.length < -this.exponent) {
            return (
                prefix +
                "0." +
                "0".repeat(-this.exponent - this.significand.length) +
                this.significand
            );
        }

        return (
            prefix +
            this.significand.substring(
                0,
                this.significand.length + this.exponent
            ) +
            "." +
            this.significand.substring(this.significand.length + this.exponent)
        );
    }

    toExponentialString(): string {
        return (
            (this.isNegative ? "-" : "") +
            (this.significand === "" ? "0" : this.significand) +
            "E" +
            this.exponent
        );
    }

    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    isInteger(): boolean {
        return this.exponent >= 0;
    }

    /**
     * Are these two Decimal1288 values equal?
     *
     * @param x
     */
    equals(x: Decimal128): boolean {
        return this.toString() === x.toString();
    }

    negate(): Decimal128 {
        if (this.isNegative) {
            return new Decimal128(this.toString().substring(1));
        }

        return new Decimal128("-" + this.toString());
    }

    /**
     * Return the absolute value of this Decimal128 value.
     */
    abs(): Decimal128 {
        if (this.isNegative) {
            return this.negate();
        }

        return this;
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

        if (n < 0) {
            throw new RangeError("Argument must be non-negative");
        }

        let [lhs, rhs] = this.toString().split(".");

        if (undefined === rhs || 0 === n) {
            return new Decimal128(lhs);
        }

        if (rhs.length <= n) {
            return this;
        }

        let penultimateDigit = parseInt(rhs.charAt(n - 1));
        let lastDigit = parseInt(rhs.charAt(n));

        if (lastDigit < 5) {
            return new Decimal128(lhs + "." + rhs.substring(0, n));
        }

        return new Decimal128(
            lhs + "." + rhs.substring(0, n - 1) + `${penultimateDigit + 1}`
        );
    }

    /**
     * Return the ceiling of this number. That is: the smallest integer greater than or equal to this number.
     */
    ceil(): Decimal128 {
        if (this.isInteger()) {
            return this;
        }

        return Decimal128.add(
            this.truncate(),
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
        let [s1, s2] = padDigits(this.toString(), x.toString());
        let [lhs1, rhs1] = s1.split(".");
        let [lhs2, rhs2] = s2.split(".");

        let bigLhs1 = BigInt(lhs1);
        let bigLhs2 = BigInt(lhs2);
        let bigRhs1 = BigInt(rhs1);
        let bigRhs2 = BigInt(rhs2);

        if (bigLhs1 < bigLhs2) {
            return -1;
        }

        if (bigLhs2 < bigLhs1) {
            return 1;
        }

        if (bigRhs1 < bigRhs2) {
            return -1;
        }

        if (bigRhs2 < bigRhs1) {
            return 1;
        }

        return 0;
    }

    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    truncate(): Decimal128 {
        let s = this.toString();
        let [lhs] = s.split(".");
        return new Decimal128(lhs);
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     * @param theArgs An array of Decimal128 values to add to this one.
     */
    static add(x: Decimal128, ...theArgs: Decimal128[]): Decimal128 {
        let theRats: Rational[] = theArgs.map((d) => d.rat);
        let resultRat = Rational.add(x.rat, ...theRats);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * Association is to the left: `a.subtract(b, c, d)` is the same as
     * `((a.subtract(b)).subtract(c)).subtract(d)`, and so one for any number
     * of arguments.
     *
     * @param x
     * @param theArgs
     */
    static subtract(x: Decimal128, ...theArgs: Decimal128[]): Decimal128 {
        let theRats: Rational[] = theArgs.map((d) => d.rat);
        let resultRat = Rational.subtract(x.rat, ...theRats);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
    }

    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     * @param theArgs
     */
    static multiply(x: Decimal128, ...theArgs: Decimal128[]): Decimal128 {
        let theRats: Rational[] = theArgs.map((d) => d.rat);
        let resultRat = Rational.multiply(x.rat, ...theRats);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
    }

    /**
     * Divide this Decimal128 value by an array of other Decimal128 values.
     *
     * Association is to the left: 1/2/3 is (1/2)/3
     *
     * If only one argument is given, just return the first argument.
     *
     * @param x
     * @param theArgs
     */
    static divide(x: Decimal128, ...theArgs: Decimal128[]): Decimal128 {
        let theRats: Rational[] = theArgs.map((d) => d.rat);
        let resultRat = Rational.divide(x.rat, ...theRats);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
    }
}
