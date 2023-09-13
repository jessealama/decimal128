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

import { countSignificantDigits } from "./common.mjs";
import { Rational } from "./rational.mjs";

const EXPONENT_MIN = -6143;
const EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

const bigTen = BigInt(10);
const bigOne = BigInt(1);
const bigZero = BigInt(0);

/**
 * Normalize a digit string. This means:
 *
 * + removing any initial zeros
 * + removing any trailing zeros
 * + rewriting -0 to 0
 * + rewriting 0.0 to 0
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

function shiftDecimalPointLeft(s: string): string {
    if (s.match(/^-/)) {
        return "-" + shiftDecimalPointLeft(s.substring(1));
    }

    let [lhs, rhs] = s.split(/[.]/);
    return lhs + rhs.substring(0, 1) + "." + rhs.substring(1);
}

function shiftDecimalPointRight(s: string): string {
    if (s.match(/^-/)) {
        return "-" + shiftDecimalPointRight(s.substring(1));
    }

    return s.substring(0, s.length - 1) + "." + s.substring(s.length - 1);
}

function roundDigitStringTiesToEven(s: string, n: number): string {
    let [lhs, rhs] = s.split(".");

    if (undefined === rhs) {
        return lhs;
    }

    if (n === 0) {
        let digit = parseInt(lhs.substring(lhs.length - 1, lhs.length));
        let nextDigit = nthSignificantDigit("0." + rhs, 0);

        if (nextDigit > 5) {
            return propagateCarryFromRight(lhs);
        }

        if (nextDigit === 5) {
            if (0 === digit % 2) {
                // round to even
                return lhs;
            }

            return propagateCarryFromRight(lhs);
        }

        return lhs;
    }

    let timesTen = normalize(shiftDecimalPointLeft(s));

    if (!timesTen.match(/[.]/)) {
        return roundDigitStringTiesToEven(s, n - 1);
    }

    return shiftDecimalPointRight(roundDigitStringTiesToEven(timesTen, n - 1));
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
 * Get the n-th significant digit of a digit string, assumed to be normalized.
 *
 * @param s digit string (assumed to be normalized)
 * @param n non-negative integer
 */
function nthSignificantDigit(s: string, n: number): number {
    return parseInt(significand(s).charAt(n));
}

function cutoffAfterSignificantDigits(s: string, n: number): string {
    if (s.match(/^-/)) {
        return "-" + cutoffAfterSignificantDigits(s.substring(1), n);
    }

    if (s.match(/^0[.]/)) {
        return s.substring(0, n + 2);
    }

    return s.substring(0, n + 1);
}

function propagateCarryFromRight(s: string): string {
    let [left, right] = s.split(/[.]/);

    if (undefined === right) {
        let lastDigit = parseInt(left.charAt(left.length - 1));
        if (lastDigit === 9) {
            if (1 === left.length) {
                return "10";
            }

            return (
                propagateCarryFromRight(left.substring(0, left.length - 1)) +
                "0"
            );
        }
        return left.substring(0, left.length - 1) + `${lastDigit + 1}`;
    }

    let len = right.length;

    if (1 === len) {
        return propagateCarryFromRight(left) + ".0";
    } else {
        let finalDigit = parseInt(right.charAt(len - 1));

        if (9 === finalDigit) {
            return (
                propagateCarryFromRight(
                    left + "." + right.substring(0, len - 1)
                ) + "0"
            );
        }

        return (
            left +
            "." +
            right.substring(0, len - 1) +
            `${parseInt(right.charAt(len - 1)) + 1}`
        );
    }
}

/**
 * Return the exponent of a digit string, assumed to be normalized. It is the number of digits
 * to the left or right that the significand needs to be shifted to recover the original (normalized)
 * digit string.
 *
 * @param s string of digits (assumed to be normalized)
 */
function exponent(s: string): number {
    if (s.match(/^-/)) {
        return exponent(s.substring(1));
    } else if (s.match(/[.]/)) {
        let rhs = s.split(".")[1];
        return 0 - rhs.length;
    } else if (s === "0") {
        return 0;
    } else {
        let m = s.match(/0+$/);
        if (m) {
            return m[0].length;
        } else {
            return 0;
        }
    }
}

interface Decimal128Constructor {
    significand: string;
    exponent: bigint;
    isNegative: boolean;
}

function isInteger(x: Decimal128Constructor): boolean {
    return x.exponent >= bigZero;
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

    if (exp.match(/^[+]/)) {
        exp = exp.substring(1);
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
    let isInteger = exp >= 0;

    if (!isInteger && numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        let lastDigit = parseInt(sg.charAt(MAX_SIGNIFICANT_DIGITS));
        let penultimateDigit = parseInt(sg.charAt(MAX_SIGNIFICANT_DIGITS - 1));
        if (lastDigit === 5) {
            if (penultimateDigit % 2 === 0) {
                let rounded = cutoffAfterSignificantDigits(
                    normalized,
                    MAX_SIGNIFICANT_DIGITS - 1
                );
                sg = significand(rounded);
                exp = exponent(rounded);
            } else if (9 === penultimateDigit) {
                let rounded =
                    cutoffAfterSignificantDigits(
                        propagateCarryFromRight(
                            cutoffAfterSignificantDigits(
                                normalized,
                                MAX_SIGNIFICANT_DIGITS - 1
                            )
                        ),
                        MAX_SIGNIFICANT_DIGITS - 2
                    ) + "0";
                sg = significand(rounded);
                exp = exponent(rounded);
            } else {
                let rounded =
                    cutoffAfterSignificantDigits(
                        normalized,
                        MAX_SIGNIFICANT_DIGITS - 2
                    ) + `${penultimateDigit + 1}`;
                sg = significand(rounded);
                exp = exponent(rounded);
            }
        } else if (lastDigit > 5) {
            let cutoff = normalize(
                cutoffAfterSignificantDigits(normalized, MAX_SIGNIFICANT_DIGITS)
            );
            let rounded = normalize(propagateCarryFromRight(cutoff));
            sg = significand(rounded);
            exp = exponent(rounded);
        } else {
            let rounded = normalize(
                cutoffAfterSignificantDigits(normalized, MAX_SIGNIFICANT_DIGITS)
            );
            sg = significand(rounded);
            exp = exponent(rounded);
        }
    }

    return {
        significand: sg,
        exponent: BigInt(exp),
        isNegative: isNegative,
    };
}

export class Decimal128 {
    public readonly significand: string;
    public readonly exponent: number;
    public readonly isNegative: boolean;
    private readonly digitStrRegExp =
        /^-?[0-9]+(?:_?[0-9]+)*(?:[.][0-9](_?[0-9]+)*)?$/;
    private readonly exponentRegExp = /^-?[1-9][0-9]*[eE][-+]?[1-9][0-9]*$/;
    private readonly rat;

    constructor(n: string) {
        let data = undefined;

        if (n.match(this.exponentRegExp)) {
            data = handleExponentialNotation(n);
        } else if (n.match(this.digitStrRegExp)) {
            data = handleDecimalNotation(n);
        } else {
            throw new SyntaxError(`Illegal number format "${n}"`);
        }

        validateConstructorData(data);

        this.significand = data.significand;
        this.exponent = parseInt(data.exponent.toString()); // safe because the min & max are less than 10000
        this.isNegative = data.isNegative;

        if ("1" === this.significand) {
            // power of ten
            if (this.exponent < 0) {
                this.rat = new Rational(
                    bigOne,
                    BigInt(
                        (this.isNegative ? "-" : "") +
                            "1" +
                            "0".repeat(0 - this.exponent)
                    )
                );
            } else if (this.exponent === 0) {
                this.rat = new Rational(
                    BigInt(this.isNegative ? -1 : 1),
                    bigOne
                );
            } else {
                this.rat = new Rational(
                    BigInt(
                        (this.isNegative ? "-" : "") +
                            "1" +
                            "0".repeat(this.exponent)
                    ),
                    bigOne
                );
            }
        } else if (this.exponent < 0) {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand),
                bigTen ** BigInt(0 - this.exponent)
            );
        } else if (this.exponent === 1) {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand + "0"),
                bigOne
            );
        } else {
            this.rat = new Rational(
                BigInt((this.isNegative ? "-" : "") + this.significand),
                bigTen ** BigInt(this.exponent)
            );
        }
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        return this.rat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS);
    }

    /**
     * Returns an exponential string representing this Decimal128.
     *
     */
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
     * Return the absolute value of this Decimal128 value.
     *
     */
    abs(): Decimal128 {
        if (this.isNegative) {
            return new Decimal128(this.toString().substring(1));
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

        let s = this.toString();
        let [lhs, rhs] = s.split(".");

        if (undefined === rhs || 0 === n) {
            return new Decimal128(lhs);
        }

        if (rhs.length <= n) {
            return new Decimal128(s);
        }

        let penultimateDigit = parseInt(rhs.charAt(n - 1));

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

        if (this.isNegative) {
            return this.truncate();
        }

        return this.add(new Decimal128("1")).truncate();
    }

    /**
     * Return the floor of this number. That is: the largest integer less than or equal to this number.
     *
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
    cmp(x: Decimal128): -1 | 0 | 1 {
        return this.rat.cmp(x.rat);
    }

    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     *
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    truncate(): Decimal128 {
        let [lhs] = this.toString().split(".");
        return new Decimal128(lhs);
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     */
    add(x: Decimal128): Decimal128 {
        let resultRat = Rational.add(this.rat, x.rat);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     */
    subtract(x: Decimal128): Decimal128 {
        return new Decimal128(
            Rational.subtract(this.rat, x.rat).toDecimalPlaces(
                MAX_SIGNIFICANT_DIGITS + 1
            )
        );
    }

    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     */
    multiply(x: Decimal128): Decimal128 {
        let resultRat = Rational.multiply(this.rat, x.rat);
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
     */
    divide(x: Decimal128): Decimal128 {
        return new Decimal128(
            Rational.divide(this.rat, x.rat).toDecimalPlaces(
                MAX_SIGNIFICANT_DIGITS + 1
            )
        );
    }

    round(n: number = 0): Decimal128 {
        if (!Number.isInteger(n)) {
            throw new TypeError("Argument must be an integer");
        }

        if (n < 0) {
            throw new RangeError("Argument must be non-negative");
        }

        return new Decimal128(roundDigitStringTiesToEven(this.toString(), n));
    }

    negate(): Decimal128 {
        let s = this.toString();

        if (s.match(/^-/)) {
            return new Decimal128(s.substring(1));
        }

        return new Decimal128("-" + s);
    }

    /**
     * Return the remainder of this Decimal128 value divided by another Decimal128 value.
     *
     * @param d
     * @throws RangeError If argument is zero
     */
    remainder(d: Decimal128): Decimal128 {
        if (this.isNegative) {
            return this.negate().remainder(d).negate();
        }

        if (d.isNegative) {
            return this.remainder(d.negate());
        }

        let q = this.divide(d).round();
        return this.subtract(d.multiply(q)).abs();
    }
}
