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
function normalize(s) {
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
function significand(s) {
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
function countSignificantDigits(s) {
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
function nthSignificantDigit(s, n) {
    return parseInt(significand(s).charAt(n));
}
function propogateCarryFromRight(s) {
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
function maybeRoundAfterNSignificantDigits(s, n) {
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
function cutoffAfterSignificantDigits(s, n) {
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
function ensureDecimalPoint(s) {
    if (s.match(/[.]/)) {
        return s;
    } else {
        return s + ".0";
    }
}
/**
 * Given a pure digit string (no decimal point), return a new digit string by pushing the decimal point
 * to the left or right by n places. A negative n pushes the decimal point to the left, and a positive
 * n pushes the decimal point to the right. If n is zero, return the given string.
 *
 * @param s
 * @param n
 */
function pushDecimalPointLeft(s, n) {
    if (0 === n) {
        return s;
    }
    if (n < 0) {
        if (s.length <= -n) {
            return "0." + "0".repeat(-n - s.length) + s;
        }
        return s.substring(0, s.length + n) + "." + s.substring(s.length + n);
    }
    let [left, right] = s.split(/[.]/);
    if (undefined === right) {
        return s + "0".repeat(n);
    }
    if (right.length <= n) {
        return left + right + "0".repeat(n - right.length);
    }
    return left + right.substring(0, n) + "." + right.substring(n);
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
function padDigits(s1, s2) {
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
 * Given two digit strings, both assumed to be non-negative (neither has a negative sign),
 * return a generator that successively yields the digits of the sum of the two numbers.
 *
 * Yields -1 to signal that the generator is moving from the integer part to the decimal part.
 *
 * @param x
 * @param y
 */
function* nextDigitForAddition(x, y) {
    let [alignedX, alignedY] = padDigits(x, y);
    let [integerDigitsX, decimalDigitsX] = alignedX.split(".");
    let [integerDigitsY, decimalDigitsY] = alignedY.split(".");
    let carry = 0;
    let numIntegerDigits = integerDigitsX.length;
    let numDecimalDigits = decimalDigitsX.length;
    for (let i = 0; i < numIntegerDigits; i++) {
        let d1 = parseInt(integerDigitsX.charAt(numIntegerDigits - i - 1));
        let d2 = parseInt(integerDigitsY.charAt(numIntegerDigits - i - 1));
        let d = carry + d1 + d2;
        if (d > 9) {
            carry = 1;
            yield d - 10;
        } else {
            carry = 0;
            yield d;
        }
    }
    yield carry;
    carry = 0;
    yield -1; // done with integer part
    for (let i = 0; i < numDecimalDigits; i++) {
        let d1 = parseInt(decimalDigitsX.charAt(i));
        let d2 = parseInt(decimalDigitsY.charAt(i));
        let d = carry + d1 + d2;
        if (d > 9) {
            carry = 1;
            yield d - 10;
        } else {
            carry = 0;
            yield d;
        }
    }
    yield carry;
    return 0;
}
function* nextDigitForDivision(x, y) {
    let result = "0";
    let bigX = BigInt(x);
    let bigY = BigInt(y);
    let emittedDecimalPoint = false;
    let done = false;
    let zero = BigInt("0");
    let ten = BigInt("10");
    while (!done && countSignificantDigits(result) <= MAX_SIGNIFICANT_DIGITS) {
        if (bigX === zero) {
            done = true;
        } else if (bigX < bigY) {
            if (emittedDecimalPoint) {
                bigX = bigX * ten;
                if (bigX < bigY) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            } else {
                emittedDecimalPoint = true;
                result = result + ".";
                bigX = bigX * ten;
                yield -1;
                if (bigX < bigY) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            }
        } else {
            let q = bigX / bigY;
            bigX = bigX % bigY;
            result = result + q.toString();
            yield parseInt(q.toString().charAt(0));
        }
    }
    return 0;
}
/**
 * Given two digit strings, both assumed to be non-negative (neither has a negative sign),
 * return a generator that successively yields the digits of the subtraction of the second from the first.
 *
 * Yields -1 to signal that the generator is moving from the decimal part to the integer part.
 *
 * @param x
 * @param y
 */
function* nextDigitForSubtraction(x, y) {
    let [alignedX, alignedY] = padDigits(x, y);
    let [integerDigitsX, decimalDigitsX] = alignedX.split(".");
    let [integerDigitsY, decimalDigitsY] = alignedY.split(".");
    let carry = 0;
    let numIntegerDigits = integerDigitsX.length;
    let numDecimalDigits = decimalDigitsX.length;
    for (let i = 0; i < numDecimalDigits; i++) {
        let d1 = parseInt(decimalDigitsX.charAt(numDecimalDigits - 1 - i));
        let d2 = parseInt(decimalDigitsY.charAt(numDecimalDigits - 1 - i));
        let d = d2 - d1 - carry;
        if (d < 0) {
            carry = -1;
            yield 10 - d;
        } else {
            carry = 0;
            yield d;
        }
    }
    yield -1; // decimal point
    for (let i = 0; i < numIntegerDigits; i++) {
        let d1 = parseInt(integerDigitsX.charAt(numIntegerDigits - 1 - i));
        let d2 = parseInt(integerDigitsY.charAt(numIntegerDigits - 1 - i));
        let d = d2 - d1 - carry;
        if (d < 0) {
            carry = -1;
            yield 10 - d;
        } else {
            carry = 0;
            yield d;
        }
    }
    return 0;
}
function* nextDigitForMultiplication(x, y) {
    let carry = 0;
    let numDigits = x.length;
    for (let i = 0; i < numDigits; i++) {
        let d = parseInt(x.charAt(numDigits - 1 - i));
        let product = d * y + carry;
        carry = Math.floor(product / 10);
        yield product % 10;
    }
    return carry;
}
/**
 * Given two digit strings, both assumed to be non-negative (neither has a negative sign),
 * and neither having a decimal point, return a generator that successively yields the digits
 * of the multiplication of the two numbers.
 *
 * @param x
 * @param y
 */
function doMultiplication(x, y) {
    if (y.length > x.length) {
        return doMultiplication(y, x);
    }
    let numYDigits = y.length;
    let numbersToAdd = [];
    for (let i = 0; i < numYDigits; i++) {
        let digitGenerator = nextDigitForMultiplication(
            x,
            parseInt(y.charAt(numYDigits - 1 - i))
        );
        let d = digitGenerator.next();
        let digits = [];
        for (let j = 0; j < i; j++) {
            digits.push("0");
        }
        while (!d.done) {
            digits.push(`${d.value}`);
            d = digitGenerator.next();
        }
        digits.push(`${d.value}`);
        numbersToAdd.push(new Decimal128(digits.reverse().join("")));
    }
    let sum = numbersToAdd.reduce((a, b) => Decimal128.add(a, b));
    return sum.toString();
}
/**
 * Return the exponent of a digit string, assumed to be normalized. It is the number of digits
 * to the left or right that the significand needs to be shifted to recover the original (normalized)
 * digit string.
 *
 * @param s string of digits (assumed to be normalized)
 */
function exponent(s) {
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
function isInteger(x) {
    if (x.exponent >= BigInt(0)) {
        return true;
    }
    let numDigits = x.significand.length;
    return BigInt(numDigits) + x.exponent >= 0;
}
function validateConstructorData(x) {
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
function handleExponentialNotation(s) {
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
function handleDecimalNotation(s) {
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
    constructor(s) {
        this.digitStrRegExp = /^-?[0-9]+(?:_?[0-9]+)*(?:[.][0-9](_?[0-9]+)*)?$/;
        this.exponentRegExp = /^-?[1-9][0-9]*[eE]-?[1-9][0-9]*$/;
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
        if (this.exponent < 0) {
            this.rat = new Rational(
                BigInt(this.isNegative ? -1 : 1),
                BigInt(this.significand) *
                    BigInt(10) ** BigInt(0 - this.exponent)
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
    toString() {
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
    toExponentialString() {
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
    isInteger() {
        return this.exponent >= 0;
    }
    /**
     * Is this Decimal128 zero?
     */
    isZero() {
        return this.significand === "";
    }
    /**
     * Are these two Decimal1288 values equal?
     *
     * @param x
     */
    equals(x) {
        return this.toString() === x.toString();
    }
    negate() {
        if (this.isNegative) {
            return new Decimal128(this.toString().substring(1));
        }
        return new Decimal128("-" + this.toString());
    }
    /**
     * Return the absolute value of this Decimal128 value.
     */
    abs() {
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
    toDecimalPlaces(n) {
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
    ceil() {
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
    floor() {
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
    cmp(x) {
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
    truncate() {
        let s = this.toString();
        let [lhs] = s.split(".");
        return new Decimal128(lhs);
    }
    /**
     * Add two Decimal128 values.
     *
     * @param x
     * @param y
     * @private
     */
    static _add(x, y) {
        if (x.isNegative && y.isNegative) {
            return Decimal128._add(x.negate(), y.negate()).negate();
        }
        if (x.isNegative) {
            return Decimal128.subtract(y, x.negate());
        }
        if (y.isNegative) {
            return Decimal128.subtract(x, y.negate());
        }
        let ourDigits = x.toString();
        let theirDigits = y.toString();
        let result = "";
        let digitGenerator = nextDigitForAddition(ourDigits, theirDigits);
        let digit = digitGenerator.next();
        let integerPartDone = false;
        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                integerPartDone = true;
                result = result + ".";
            } else if (integerPartDone) {
                result = result + `${v}`;
            } else {
                result = `${v}` + result;
            }
            digit = digitGenerator.next();
        }
        return new Decimal128(result);
    }
    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     * @param theArgs An array of Decimal128 values to add to this one.
     */
    static add(x, ...theArgs) {
        let result = x;
        for (let y of theArgs) {
            result = Decimal128._add(result, y);
        }
        return result;
    }
    /**
     * Subtract another Decimal128 value from this one.
     *
     * @param x
     * @param y
     * @private
     */
    static _subtract(x, y) {
        if (y.isNegative) {
            return Decimal128.add(x, y.negate());
        }
        if (x.isNegative) {
            return Decimal128.add(x.negate(), y).negate();
        }
        let ourDigits = x.toString();
        let theirDigits = y.toString();
        let result = "";
        let digitGenerator = nextDigitForSubtraction(theirDigits, ourDigits);
        let digit = digitGenerator.next();
        while (!digit.done) {
            let v = digit.value;
            result = (-1 === v ? "." : `${v}`) + result;
            digit = digitGenerator.next();
        }
        return new Decimal128(result);
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
    static subtract(x, ...theArgs) {
        let result = x;
        for (let y of theArgs) {
            result = Decimal128._subtract(result, y);
        }
        return result;
    }
    static _multiply(x, y) {
        if (x.isNegative) {
            return Decimal128._multiply(x.negate(), y).negate();
        }
        if (y.isNegative) {
            return Decimal128._multiply(x, y.negate()).negate();
        }
        let result = doMultiplication(x.significand, y.significand);
        return new Decimal128(
            pushDecimalPointLeft(result, x.exponent + y.exponent)
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
    static multiply(x, ...theArgs) {
        let result = x;
        for (let y of theArgs) {
            result = Decimal128._multiply(result, y);
        }
        return result;
    }
    /**
     * Divide this Decimal128 value by another.
     *
     * Throws a RangeError if the divisor is zero.
     *
     * @param x
     * @param y
     */
    static _divide(x, y) {
        if (y.isZero()) {
            throw new RangeError("Cannot divide by zero");
        }
        if (x.isNegative) {
            return Decimal128._divide(x.negate(), y).negate();
        }
        if (y.isNegative) {
            return Decimal128._divide(x, y.negate()).negate();
        }
        if (!x.isInteger() || !y.isInteger()) {
            let ten = new Decimal128("10");
            return Decimal128._divide(
                Decimal128._multiply(x, ten),
                Decimal128._multiply(y, ten)
            );
        }
        let digitGenerator = nextDigitForDivision(x.toString(), y.toString());
        let digit = digitGenerator.next();
        let integerPartDone = false;
        let result = "";
        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                integerPartDone = true;
                result = ("" === result ? "0" : result) + ".";
            } else if (integerPartDone) {
                result = result + `${v}`;
            } else {
                result = `${v}` + result;
            }
            digit = digitGenerator.next();
        }
        return new Decimal128(result);
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
    static divide(x, ...theArgs) {
        if (theArgs.length) {
            let q = Decimal128.multiply(theArgs[0], ...theArgs.slice(1));
            return Decimal128._divide(x, q);
        }
        return x;
    }
}
