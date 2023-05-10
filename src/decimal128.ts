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

const exponentMin = -6143;
const exponentMax = 6144;
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
 * Given a pure digit string (no decimal point), return a new digit string by pushing the decimal point
 * to the left or right by n places. A negative n pushes the decimal point to the left, and a positive
 * n pushes the decimal point to the right. If n is zero, return the given string.
 *
 * @param s
 * @param n
 */
function pushDecimalPointLeft(s: string, n: number): string {
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
 * Given two digit strings, both assumed to be non-negative (neither has a negative sign),
 * return a generator that successively yields the digits of the sum of the two numbers.
 *
 * Yields -1 to signal that the generator is moving from the integer part to the decimal part.
 *
 * @param x
 * @param y
 */
function* nextDigitForAddition(x: string, y: string): Generator<number> {
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

function* nextDigitForDivision(x: string, y: string): Generator<number> {
    let result = "0";
    let queuedZeroes = "";
    let bigX = BigInt(x);
    let bigY = BigInt(y);
    let emittedDecimalPoint = false;
    let done = false;
    let zero = BigInt("0");
    let ten = BigInt("10");

    while (!done && countSignificantDigits(result) <= maxSigDigits) {
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
            let r = bigX % bigY;
            bigX = r;
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
function* nextDigitForSubtraction(x: string, y: string): Generator<number> {
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

function* nextDigitForMultiplication(x: string, y: number): Generator<number> {
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
function doMultiplication(x: string, y: string): string {
    if (y.length > x.length) {
        return doMultiplication(y, x);
    }

    let numYDigits = y.length;

    let numbersToAdd: Decimal128[] = [];

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

    let sum = numbersToAdd.reduce((a, b) => a.add(b));

    return sum.toString();
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
        return m[0].length;
    } else {
        return 0;
    }
}

export class Decimal128 {
    public static E = new Decimal128(DIGITS_E);
    public readonly significand: string;
    public readonly exponent: number;
    public readonly isNegative: boolean;
    private readonly digitStrRegExp = /^-?[0-9]+([.][0-9]+)?$/;
    private readonly digits: string;

    constructor(s: string, e?: number) {
        if (!s.match(this.digitStrRegExp)) {
            throw new SyntaxError(`Illegal number format "${s}"`);
        }

        let normalized = normalize(s);

        this.isNegative = !!normalized.match(/^-/);

        let sg = significand(normalized);
        let exp = undefined === e ? exponent(normalized) : e;
        let isInteger = exp >= 0;

        let numSigDigits = countSignificantDigits(normalized);

        if (isInteger && numSigDigits > maxSigDigits) {
            throw new RangeError("Integer too large");
        }

        if (numSigDigits > maxSigDigits) {
            let rounded = maybeRoundAfterNSignificantDigits(
                normalized,
                maxSigDigits
            );
            return new Decimal128(rounded);
        }

        if (exp > exponentMax) {
            throw new RangeError(`Exponent too big (${exp})`);
        }

        if (exp < exponentMin) {
            throw new RangeError(`Exponent too small (${exp})`);
        }

        this.digits = s;
        this.significand = sg;
        this.exponent = exp;
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

    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    isInteger(): boolean {
        return this.exponent >= 0;
    }

    /**
     * Is this Decimal128 zero?
     */
    isZero(): boolean {
        return this.significand === "";
    }

    /**
     * Are these two Decimal1288 values equal?
     *
     * @param x
     */
    equals(x: Decimal128): boolean {
        return (
            this.significand === x.significand &&
            this.exponent === x.exponent &&
            this.isNegative === x.isNegative
        );
    }

    /**
     * Add this Decimal128 value to another.
     * @param x
     */
    add(x: Decimal128): Decimal128 {
        if (this.isNegative && x.isNegative) {
            return this.negate().add(x.negate()).negate();
        }

        let ourDigits = this.toString();
        let theirDigits = x.toString();
        let result = "";

        if (this.isNegative) {
            return x.subtract(this.negate());
        }

        if (x.isNegative) {
            return this.subtract(x.negate());
        }

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
     * Subtract another Decimal128 value from this one.
     *
     * @param x
     */
    subtract(x: Decimal128): Decimal128 {
        if (x.isNegative) {
            return this.add(x.negate());
        }

        if (this.isNegative) {
            return this.negate().add(x).negate();
        }

        let ourDigits = this.toString();
        let theirDigits = x.toString();
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

    negate(): Decimal128 {
        if (this.isNegative) {
            return new Decimal128(this.toString().substring(1));
        }

        return new Decimal128("-" + this.toString());
    }

    /**
     * Multiply this Decimal128 value by another.
     *
     * @param x
     */
    multiply(x: Decimal128): Decimal128 {
        if (this.isNegative) {
            return this.negate().multiply(x).negate();
        }

        if (x.isNegative) {
            return this.multiply(x.negate()).negate();
        }

        let result = doMultiplication(this.significand, x.significand);

        return new Decimal128(
            pushDecimalPointLeft(result, this.exponent + x.exponent)
        );
    }

    /**
     * Divide this Decimal128 value by another.
     *
     * Throws a RangeError if the divisor is zero.
     *
     * @param x
     */
    divide(x: Decimal128): Decimal128 {
        if (x.isZero()) {
            throw new RangeError("Cannot divide by zero");
        }

        if (this.isNegative) {
            return this.negate().divide(x).negate();
        }

        if (x.isNegative) {
            return this.divide(x.negate()).negate();
        }

        if (!this.isInteger() || !x.isInteger()) {
            let ten = new Decimal128("10");
            return this.multiply(ten).divide(x.multiply(ten));
        }

        let digitGenerator = nextDigitForDivision(
            this.toString(),
            x.toString()
        );
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

    reciprocal(): Decimal128 {
        return new Decimal128("1").divide(this);
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

        if (this.isZero() && x.isZero()) {
            throw new RangeError("Cannot raise zero to zero power");
        }

        if (!x.isInteger()) {
            throw new RangeError("Cannot raise to non-integer power");
        }

        let zero = new Decimal128("0");
        let one = new Decimal128("1");

        if (x.isNegative) {
            return this.exp(x.negate()).reciprocal();
        }

        if (this.isZero()) {
            return zero;
        }

        if (x.isZero()) {
            return one;
        }

        let result = one;
        let i = new Decimal128("0");
        let done = false;
        while (!done) {
            if (i.cmp(x) >= 0) {
                done = true;
            } else {
                result = result.multiply(this);
                i = i.add(one);
            }
        }

        return result;
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

        if (0 === n || undefined === rhs) {
            return new Decimal128(lhs);
        }

        return new Decimal128(lhs + "." + rhs.substring(0, n));
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
}
