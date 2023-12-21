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

import { countSignificantDigits, Digit, DigitOrTen } from "./common.mjs";
import { Rational } from "./rational.mjs";

const EXPONENT_MIN = -6143;
const EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

const bigTen = BigInt(10);
const bigOne = BigInt(1);

/**
 * Normalize a digit string. This means:
 *
 * + removing any initial zeros
 * + removing any trailing zeros
 * + rewriting 0.0 to 0
 *
 * Sign is preserved. Thus, -0.0 (e.g.) gets normalized to -0.
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
        return "-" + normalize(s.substring(1));
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
    }

    if (s.match(/^0+[.]/)) {
        return significand(s.replace(/^0+[.]/, ""));
    }

    if (s.match(/^0+/)) {
        let noLeadingZeroes = s.replace(/^0+/, "");

        if ("" === noLeadingZeroes) {
            return "0";
        }

        return significand(noLeadingZeroes);
    }

    if (s.match(/[.]/)) {
        return s.replace(/[.]/, "");
    }

    if (s.match(/0+$/)) {
        return significand(s.replace(/0+$/, ""));
    }

    return s;
}

function cutoffAfterSignificantDigits(s: string, n: number): string {
    return s.substring(0, n);
}

function propagateCarryFromRight(s: string): string {
    let [left] = s.split(/[.]/);

    let lastDigit = parseInt(left.charAt(left.length - 1));
    if (lastDigit === 9) {
        if (1 === left.length) {
            return "10";
        }

        return (
            propagateCarryFromRight(left.substring(0, left.length - 1)) + "0"
        );
    }
    return left.substring(0, left.length - 1) + `${lastDigit + 1}`;
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
    }

    if (s.match(/[.]/)) {
        let rhs = s.split(".")[1];
        return 0 - rhs.length;
    }

    if (s.match(/^0+$/) || s.match(/^0+$/)) {
        return 0;
    }

    let trailingZeros = s.match(/0+$/);

    if (trailingZeros) {
        return trailingZeros[0].length;
    }

    return 0;
}

interface Decimal128Constructor {
    significand: string;
    exponent: number;
    isNegative: boolean;
}

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";

function validateConstructorData(x: Decimal128Constructor): void {
    let sig = x.significand;

    if (sig === NAN || sig === POSITIVE_INFINITY || sig === NEGATIVE_INFINITY) {
        return; // no further validation needed
    }

    let numSigDigits = countSignificantDigits(x.significand);

    if (numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        throw new RangeError("Too many significant digits");
    }

    if (x.exponent > EXPONENT_MAX) {
        throw new RangeError(`Exponent too big (${exponent})`);
    }

    if (x.exponent < EXPONENT_MIN) {
        throw new RangeError(`Exponent too small (${exponent})`);
    }
}

function convertExponentialNotationToDecimalNotation(
    significand: string,
    exponent: number
): string {
    if (exponent >= 0) {
        return significand + "0".repeat(exponent);
    }

    if (significand.length + exponent <= 0) {
        return (
            "0." + "0".repeat(0 - exponent - significand.length) + significand
        );
    }

    return (
        significand.substring(0, significand.length + exponent) +
        "." +
        significand.substring(significand.length + exponent)
    );
}

function handleNan(): Decimal128Constructor {
    return {
        significand: NAN,
        exponent: 0,
        isNegative: false,
    };
}

type SignificandExponent = {
    significand: string;
    exponent: number;
};

function adjustInteger(initialSignificand: string): SignificandExponent {
    let m = initialSignificand.match(/(0+)$/);

    if (!m) {
        return {
            significand: initialSignificand,
            exponent: 0,
        };
    }

    let numTrailingZeros = m[0].length;
    return {
        significand: initialSignificand.substring(
            0,
            initialSignificand.length - numTrailingZeros
        ),
        exponent: numTrailingZeros,
    };
}

function adjustNonInteger(
    initialSignificand: string,
    initialExponent: number
): SignificandExponent {
    let lastDigit = parseInt(initialSignificand.charAt(MAX_SIGNIFICANT_DIGITS));
    let penultimateDigit = parseInt(
        initialSignificand.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    );
    let excessDigits = initialSignificand.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = initialExponent + numExcessDigits; // we will chop off the excess digits
    if (lastDigit === 5) {
        if (penultimateDigit % 2 === 0) {
            let rounded = cutoffAfterSignificantDigits(
                initialSignificand,
                MAX_SIGNIFICANT_DIGITS
            );
            return {
                significand: rounded,
                exponent: exp,
            };
        }

        if (9 === penultimateDigit) {
            let cutoff = cutoffAfterSignificantDigits(
                initialSignificand,
                MAX_SIGNIFICANT_DIGITS - 1
            );
            let carried = propagateCarryFromRight(cutoff);
            let rounded =
                cutoffAfterSignificantDigits(
                    carried,
                    MAX_SIGNIFICANT_DIGITS - 1
                ) + "0";
            return {
                significand: rounded,
                exponent: exp,
            };
        }

        let rounded =
            cutoffAfterSignificantDigits(
                initialSignificand,
                MAX_SIGNIFICANT_DIGITS - 1
            ) + `${penultimateDigit + 1}`;
        return {
            significand: rounded,
            exponent: exp,
        };
    }

    if (lastDigit > 5) {
        if (9 === penultimateDigit) {
            let cutoff = cutoffAfterSignificantDigits(
                initialSignificand,
                MAX_SIGNIFICANT_DIGITS - 1
            );
            let carried = propagateCarryFromRight(cutoff);
            let rounded =
                cutoffAfterSignificantDigits(
                    carried,
                    MAX_SIGNIFICANT_DIGITS - 1
                ) + "0";
            let digitWasAdded = carried.length > cutoff.length;
            if (digitWasAdded && exp < 0) {
                exp++;
            }
            return {
                significand: rounded,
                exponent: exp,
            };
        }

        let cutoff = cutoffAfterSignificantDigits(
            initialSignificand,
            MAX_SIGNIFICANT_DIGITS
        );
        let rounded = propagateCarryFromRight(cutoff);
        return {
            significand: rounded,
            exponent: exp,
        };
    }

    let rounded = cutoffAfterSignificantDigits(
        initialSignificand,
        MAX_SIGNIFICANT_DIGITS
    );
    return {
        significand: rounded,
        exponent: exp,
    };
}

type DigitPair = [Digit, Digit];

function prepareLeftHandSideForSquareRoot(s: string): DigitPair[] {
    let [lhs] = s.split(".");
    let numDigits = lhs.length;

    let digitPairs: DigitPair[] = [];

    if (numDigits % 2 === 1) {
        let firstDigit = parseInt(lhs.charAt(0)) as Digit;
        digitPairs.push([0, firstDigit]);
        numDigits--;
    }

    for (let i = 0; i < numDigits / 2; i++) {
        let d1 = parseInt(lhs.charAt(2 * i)) as Digit;
        let d2 = parseInt(lhs.charAt(2 * i + 1)) as Digit;
        digitPairs.push([d1, d2]);
    }

    return digitPairs;
}

function prepareRightHandSideForSquareRoot(s: string): DigitPair[] {
    let [_, rhs] = s.split(".");

    if (undefined === rhs) {
        return [];
    }

    let numDigits = rhs.length;

    let digitPairs: DigitPair[] = [];

    for (let i = 0; i < (numDigits - 1) / 2; i++) {
        let d1 = parseInt(rhs.charAt(2 * i)) as Digit;
        let d2 = parseInt(rhs.charAt(2 * i + 1)) as Digit;
        digitPairs.push([d1, d2]);
    }

    if (numDigits % 2 === 1) {
        let lastDigit = parseInt(rhs.charAt(numDigits - 1)) as Digit;
        digitPairs.push([0, lastDigit]);
    }

    return digitPairs;
}

function valueOfDigitPair(digitPair: DigitPair): bigint {
    let [d1, d2] = digitPair;
    return BigInt(`${d1}${d2}`);
}

function nextDigit(p: bigint, c: DigitPair, r: bigint): bigint {
    let x: bigint = 0n;
    let v: bigint = 100n * r + valueOfDigitPair(c);
    while (x * (20n * p + x) <= v) {
        x = x + 1n;
    }
    return x - 1n;
}

function* nextDigitForSquareRoot(s: string): Generator<Digit> {
    let leftDigits = prepareLeftHandSideForSquareRoot(s);
    let rightDigits = prepareRightHandSideForSquareRoot(s);
    let numDigitsEmitted = 0;

    let p: bigint = 0n;
    let c = 0n;
    let r = 0n;
    for (let digitPair of leftDigits) {
        let x = nextDigit(p, digitPair, r);
        let y = x * (20n * p + x);
        let d = parseInt(x.toString()) as Digit;
        yield d;
        numDigitsEmitted++;
        p = 10n * p + x;
        c = 100n * r + valueOfDigitPair(digitPair);
        r = c - y;
    }

    if (r === 0n && rightDigits.length === 0) {
        return; // exact integer square root
    }

    yield -1;

    for (let digitPair of rightDigits) {
        let x = nextDigit(p, digitPair, r);
        let y = x * (20n * p + x);
        let d = parseInt(x.toString()) as Digit;
        yield d;
        numDigitsEmitted++;
        p = 10n * p + x;
        c = 100n * r + valueOfDigitPair(digitPair);
        r = c - y;
    }

    // we may still be able to emit more digits
    while (r !== 0n && numDigitsEmitted < MAX_SIGNIFICANT_DIGITS + 1) {
        let x = nextDigit(p, [0, 0], r);
        let y = x * (20n * p + x);
        let d = parseInt(x.toString()) as Digit;
        yield d;
        numDigitsEmitted++;
        p = 10n * p + x;
        c = 100n * r + valueOfDigitPair([0, 0]);
        r = c - y;
    }

    return;
}

function handleExponentialNotation(
    s: string,
    options: FullySpecifiedConstructorOptions
): Decimal128Constructor {
    let [sg, expString] = s.match(/e/) ? s.split("e") : s.split("E");
    let isNegative = false;
    let exp = Number(expString);

    if (sg.match(/^-/)) {
        isNegative = true;
        sg = sg.substring(1);
    }

    if (sg.match(/[.]/)) {
        let [lhs, rhs] = sg.split(".");
        sg = lhs + rhs;
        exp = exp - rhs.length;
    }

    let numSigDigits = sg.length;
    let digitForm = convertExponentialNotationToDecimalNotation(sg, exp);
    let isInteger = !digitForm.match(/[.]/);

    if (numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        if (isInteger) {
            let adjusted = adjustInteger(sg);
            sg = adjusted.significand;
            exp = adjusted.exponent;
        } else {
            let adjusted = adjustNonInteger(sg, exp);
            sg = adjusted.significand;
            exp = adjusted.exponent;
        }
    }

    return {
        significand: sg,
        exponent: exp,
        isNegative: isNegative,
    };
}

function handleDecimalNotation(
    s: string,
    options: FullySpecifiedConstructorOptions
): Decimal128Constructor {
    let withoutUnderscores = s.replace(/_/g, "");
    let isNegative = !!withoutUnderscores.match(/^-/);
    let sg = significand(withoutUnderscores);
    let exp = exponent(withoutUnderscores);
    let numSigDigits = countSignificantDigits(withoutUnderscores);
    let isInteger = exp >= 0;

    if (numSigDigits > MAX_SIGNIFICANT_DIGITS) {
        if (isInteger) {
            let adjusted = adjustInteger(withoutUnderscores);
            sg = adjusted.significand;
            exp = adjusted.exponent;
        } else {
            let adjusted = adjustNonInteger(sg, exp);
            sg = adjusted.significand;
            exp = adjusted.exponent;
        }
    }

    return {
        significand: sg,
        exponent: exp,
        isNegative: isNegative,
    };
}

function handleInfinity(s: string): Decimal128Constructor {
    return {
        significand: POSITIVE_INFINITY,
        exponent: 0,
        isNegative: !!s.match(/^-/),
    };
}

export const ROUNDING_MODE_CEILING: RoundingMode = "ceil";
export const ROUNDING_MODE_FLOOR: RoundingMode = "floor";
export const ROUNDING_MODE_EXPAND: RoundingMode = "expand";
export const ROUNDING_MODE_TRUNCATE: RoundingMode = "trunc";
export const ROUNDING_MODE_HALF_EVEN: RoundingMode = "halfEven";
export const ROUNDING_MODE_HALF_EXPAND: RoundingMode = "halfExpand";
export const ROUNDING_MODE_HALF_CEILING: RoundingMode = "halfCeil";
export const ROUNDING_MODE_HALF_FLOOR: RoundingMode = "halfFloor";
export const ROUNDING_MODE_HALF_TRUNCATE: RoundingMode = "halfTrunc";

const ROUNDING_MODE_DEFAULT = ROUNDING_MODE_HALF_EXPAND;

function roundIt(
    isNegative: boolean,
    digitToRound: Digit,
    decidingDigit: Digit,
    roundingMode: RoundingMode
): DigitOrTen {
    switch (roundingMode) {
        case ROUNDING_MODE_CEILING:
            if (isNegative) {
                return digitToRound;
            }

            return (digitToRound + 1) as DigitOrTen;
        case ROUNDING_MODE_FLOOR:
            if (isNegative) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        case ROUNDING_MODE_EXPAND:
            return (digitToRound + 1) as DigitOrTen;
        case ROUNDING_MODE_TRUNCATE:
            return digitToRound;
        case ROUNDING_MODE_HALF_CEILING:
            if (decidingDigit >= 5) {
                if (isNegative) {
                    return digitToRound;
                }

                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        case ROUNDING_MODE_HALF_FLOOR:
            if (decidingDigit === 5) {
                if (isNegative) {
                    return (digitToRound + 1) as DigitOrTen;
                }

                return digitToRound;
            }

            if (decidingDigit > 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        case ROUNDING_MODE_HALF_TRUNCATE:
            if (decidingDigit === 5) {
                return digitToRound;
            }

            if (decidingDigit > 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        case ROUNDING_MODE_HALF_EXPAND:
            if (decidingDigit >= 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        default: // ROUNDING_MODE_HALF_EVEN:
            if (decidingDigit === 5) {
                if (digitToRound % 2 === 0) {
                    return digitToRound;
                }

                return (digitToRound + 1) as DigitOrTen;
            }

            if (decidingDigit > 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
    }
}

type RoundingMode =
    | "ceil"
    | "floor"
    | "expand"
    | "trunc"
    | "halfEven"
    | "halfExpand"
    | "halfCeil"
    | "halfFloor"
    | "halfTrunc";

const digitStrRegExp = /^-?[0-9]+(?:_?[0-9]+)*(?:[.][0-9](_?[0-9]+)*)?$/;
const exponentRegExp = /^-?[0-9]+([.][0-9]+)*[eE][-+]?[0-9]+$/;
const nanRegExp = /^-?nan$/i;
const infRegExp = /^-?inf(inity)?$/i;

interface Decimal128ConstructorOptions {
    roundingMode?: RoundingMode;
}

interface FullySpecifiedConstructorOptions {
    roundingMode: RoundingMode;
}

const DEFAULT_CONSTRUCTOR_OPTIONS: FullySpecifiedConstructorOptions = {
    roundingMode: ROUNDING_MODE_DEFAULT,
};

function ensureFullySpecifiedConstructorOptions(
    options?: Decimal128ConstructorOptions
): FullySpecifiedConstructorOptions {
    if (undefined === options) {
        return DEFAULT_CONSTRUCTOR_OPTIONS;
    }

    if (undefined === options.roundingMode) {
        return DEFAULT_CONSTRUCTOR_OPTIONS;
    }

    return options as FullySpecifiedConstructorOptions;
}

export class Decimal128 {
    public readonly significand: string;
    public readonly exponent: number;
    public readonly isNegative: boolean;
    private readonly rat;

    constructor(n: string, options?: Decimal128ConstructorOptions) {
        let data = undefined;

        let fullySpecifiedOptions =
            ensureFullySpecifiedConstructorOptions(options);

        if (n.match(nanRegExp)) {
            data = handleNan();
        } else if (n.match(exponentRegExp)) {
            data = handleExponentialNotation(n, fullySpecifiedOptions);
        } else if (n.match(digitStrRegExp)) {
            data = handleDecimalNotation(n, fullySpecifiedOptions);
        } else if (n.match(infRegExp)) {
            data = handleInfinity(n);
        } else {
            throw new SyntaxError(`Illegal number format "${n}"`);
        }

        validateConstructorData(data);

        this.isNegative = data.isNegative;
        this.exponent = data.exponent;
        this.significand = data.significand;

        if (
            this.significand === NAN ||
            this.significand === POSITIVE_INFINITY
        ) {
            this.rat = new Rational(0n, 1n);
        } else {
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
                    BigInt(
                        (this.isNegative ? "-" : "") + this.significand + "0"
                    ),
                    bigOne
                );
            } else {
                this.rat = new Rational(
                    BigInt((this.isNegative ? "-" : "") + this.significand),
                    bigTen ** BigInt(this.exponent)
                );
            }
        }
    }

    isNaN(): boolean {
        return this.significand === NAN;
    }

    isFinite(): boolean {
        if (this.isNaN()) {
            return false;
        }

        let sig = this.significand;

        return sig !== POSITIVE_INFINITY && sig !== NEGATIVE_INFINITY;
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative ? "-" : "") + POSITIVE_INFINITY;
        }

        let prefix = this.isNegative ? "-" : "";
        let sg = this.significand;
        let exp = this.exponent;

        if (exp >= 0) {
            return prefix + (sg + "0".repeat(exp)).replace(/^0+$/, "0");
        }

        if (sg.length + exp <= 0) {
            return prefix + "0." + "0".repeat(0 - exp - sg.length) + sg;
        }

        return (
            prefix +
            sg.substring(0, sg.length + exp) +
            "." +
            sg.substring(sg.length + exp)
        );
    }

    /**
     * Returns an exponential string representing this Decimal128.
     *
     */
    toExponentialString(): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative ? "-" : "") + POSITIVE_INFINITY;
        }

        let sig = this.significand;
        let prefix = this.isNegative ? "-" : "";
        let adjustedExponent = this.exponent + sig.length - 1;

        if (sig.length === 1) {
            return (
                prefix +
                sig +
                "E" +
                (this.exponent < 0 ? "" : "+") +
                this.exponent
            );
        }

        return (
            prefix +
            sig.substring(0, 1) +
            "." +
            sig.substring(1) +
            "E" +
            (adjustedExponent < 0 ? "" : "+") +
            adjustedExponent
        );
    }

    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    isInteger(): boolean {
        return !!this.toString().match(/^-?[0-9]+([.]0+)?$/);
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
    cmp(x: Decimal128): -1 | 0 | 1 | undefined {
        if (this.isNaN() || x.isNaN()) {
            return undefined;
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative === x.isNegative) {
                    return 0;
                }

                return this.isNegative ? -1 : 1;
            }

            if (this.isNegative) {
                return -1;
            }

            return 1;
        }

        if (!x.isFinite()) {
            return x.isNegative ? 1 : -1;
        }

        return this.rat.cmp(x.rat);
    }

    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     *
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    truncate(): Decimal128 {
        if (!this.isFinite()) {
            return this;
        }

        let [lhs] = this.toString().split(".");
        return new Decimal128(lhs);
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     * @param options
     */
    add(x: Decimal128, options?: Decimal128ConstructorOptions): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative === x.isNegative) {
                    return this;
                }

                return new Decimal128(NAN);
            }

            return this;
        }

        if (!x.isFinite()) {
            return x;
        }

        if (this.isNegative && x.isNegative) {
            return this.negate().add(x.negate(), options).negate();
        }

        let resultRat = Rational.add(this.rat, x.rat);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            options
        );
        return initialResult.setExponent(Math.min(this.exponent, x.exponent));
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     * @param options
     */
    subtract(
        x: Decimal128,
        options?: Decimal128ConstructorOptions
    ): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative === x.isNegative) {
                    return new Decimal128(NAN);
                }

                return this;
            }

            return this;
        }

        if (!x.isFinite()) {
            return x.negate();
        }

        if (x.isNegative) {
            return this.add(x.negate(), options);
        }

        let initialResult = new Decimal128(
            Rational.subtract(this.rat, x.rat).toDecimalPlaces(
                MAX_SIGNIFICANT_DIGITS + 1
            ),
            options
        );
        return initialResult.setExponent(Math.min(this.exponent, x.exponent));
    }

    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     * @param options
     */
    multiply(
        x: Decimal128,
        options?: Decimal128ConstructorOptions
    ): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (x.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative === x.isNegative) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative === x.isNegative) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (this.isNegative) {
            return this.negate().multiply(x, options).negate();
        }

        if (x.isNegative) {
            return this.multiply(x.negate(), options).negate();
        }

        let resultRat = Rational.multiply(this.rat, x.rat);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            options
        );
        return initialResult.setExponent(this.exponent + x.exponent);
    }

    private isZero(): boolean {
        return this.isFinite() && this.significand === "0";
    }

    /**
     * Divide this Decimal128 value by an array of other Decimal128 values.
     *
     * Association is to the left: 1/2/3 is (1/2)/3
     *
     * If only one argument is given, just return the first argument.
     *
     * @param x
     * @param options
     */
    divide(x: Decimal128, options?: Decimal128ConstructorOptions): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (x.isZero()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative === x.isNegative) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            if (this.isNegative) {
                return this;
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isNegative === x.isNegative) {
                return new Decimal128("0");
            }

            return new Decimal128("-0");
        }

        if (this.isNegative) {
            return this.negate().divide(x, options).negate();
        }

        if (x.isNegative) {
            return this.divide(x.negate(), options).negate();
        }

        let adjust = 0;
        let dividendCoefficient = this.significand;
        let divisorCoefficient = x.significand;

        if (dividendCoefficient !== "0") {
            while (BigInt(dividendCoefficient) < BigInt(divisorCoefficient)) {
                dividendCoefficient = dividendCoefficient + "0";
                adjust++;
            }
        }

        while (
            BigInt(dividendCoefficient) >=
            BigInt(divisorCoefficient) * 10n
        ) {
            divisorCoefficient += "0";
            adjust--;
        }

        let resultCoefficient = 0n;
        let done = false;

        while (!done) {
            while (BigInt(divisorCoefficient) <= BigInt(dividendCoefficient)) {
                dividendCoefficient = String(
                    BigInt(dividendCoefficient) - BigInt(divisorCoefficient)
                );
                resultCoefficient++;
            }
            if (
                (BigInt(dividendCoefficient) === 0n && adjust >= 0) ||
                resultCoefficient.toString().length > MAX_SIGNIFICANT_DIGITS
            ) {
                done = true;
            } else {
                resultCoefficient = resultCoefficient * 10n;
                dividendCoefficient = dividendCoefficient + "0";
                adjust++;
            }
        }

        let resultExponent = this.exponent - (x.exponent + adjust);
        return new Decimal128(
            `${resultCoefficient}E${resultExponent}`,
            options
        );
    }

    /**
     *
     * @param numDecimalDigits
     * @param {RoundingMode} mode (default: ROUNDING_MODE_DEFAULT)
     */
    round(
        numDecimalDigits: number = 0,
        mode: RoundingMode = ROUNDING_MODE_DEFAULT
    ): Decimal128 {
        if (!Number.isSafeInteger(numDecimalDigits)) {
            throw new RangeError(
                "Argument for number of decimal digits must be a safe integer"
            );
        }

        if (numDecimalDigits < 0) {
            throw new RangeError(
                "Argument for number of decimal digits must be non-negative"
            );
        }

        if (this.isNaN() || !this.isFinite()) {
            return this;
        }

        let s = this.toString();
        let [lhs, rhs] = s.split(".");

        if (undefined === rhs) {
            rhs = "";
        }

        rhs = rhs + "0".repeat(numDecimalDigits);

        let finalIntegerDigit = parseInt(
            numDecimalDigits > 0
                ? rhs.charAt(numDecimalDigits - 1)
                : lhs.charAt(lhs.length - 1)
        ) as Digit;
        let firstDecimalDigit = parseInt(rhs.charAt(numDecimalDigits)) as Digit;
        let roundedFinalDigit = roundIt(
            this.isNegative,
            finalIntegerDigit,
            firstDecimalDigit,
            mode
        );
        return new Decimal128(
            numDecimalDigits > 0
                ? lhs +
                  "." +
                  rhs.substring(0, numDecimalDigits - 1) +
                  `${roundedFinalDigit}`
                : lhs.substring(0, lhs.length - 1) + `${roundedFinalDigit}`
        );
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
     * @param options
     * @throws RangeError If argument is zero
     */
    remainder(
        d: Decimal128,
        options?: Decimal128ConstructorOptions
    ): Decimal128 {
        if (this.isNaN() || d.isNaN()) {
            return new Decimal128(NAN);
        }

        if (this.isNegative) {
            return this.negate().remainder(d, options).negate();
        }

        if (d.isNegative) {
            return this.remainder(d.negate(), options);
        }

        if (!this.isFinite()) {
            return new Decimal128(NAN);
        }

        if (!d.isFinite()) {
            return this;
        }

        if (this.cmp(d) === -1) {
            return this;
        }

        let q = this.divide(d).truncate();
        return this.subtract(d.multiply(q), options).abs();
    }

    reciprocal(options?: Decimal128ConstructorOptions): Decimal128 {
        return new Decimal128("1").divide(this, options);
    }

    pow(n: Decimal128, options?: Decimal128ConstructorOptions): Decimal128 {
        if (!n.isInteger()) {
            throw new TypeError("Exponent must be an integer");
        }

        if (n.isNegative) {
            return this.pow(n.negate()).reciprocal(options);
        }

        let one = new Decimal128("1");
        let i = new Decimal128("0");
        let result: Decimal128 = one;
        while (i.cmp(n) === -1) {
            result = result.multiply(this, options);
            i = i.add(one);
        }

        return result;
    }

    normalize(): Decimal128 {
        return new Decimal128(normalize(this.toString()));
    }

    squareRoot(options?: Decimal128ConstructorOptions): Decimal128 {
        if (this.isNegative) {
            throw new RangeError(
                "Cannot compute square root of negative numbers"
            );
        }

        let digitGenerator = nextDigitForSquareRoot(this.toString());

        let digit = digitGenerator.next();
        let result = "";

        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                result = result + ".";
            } else {
                result = result + `${v}`;
            }

            digit = digitGenerator.next();
        }

        return new Decimal128(result, options);
    }

    multiplyAndAdd(
        x: Decimal128,
        y: Decimal128,
        options?: Decimal128ConstructorOptions
    ): Decimal128 {
        if (this.isNaN() || x.isNaN() || y.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (x.isZero()) {
                return new Decimal128(NAN);
            }
            return this.multiply(x).add(y, options);
        }

        if (!x.isFinite()) {
            if (this.isZero()) {
                return new Decimal128(NAN);
            }
            return this.multiply(x).add(y, options);
        }

        if (!y.isFinite()) {
            return y;
        }

        let resultRat = Rational.add(Rational.multiply(this.rat, x.rat), y.rat);
        return new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            options
        );
    }

    private incrementExponent(): Decimal128 {
        let exp = this.exponent;
        let sig = this.significand;

        if (!sig.match(/0$/)) {
            throw new RangeError("Significand must end in zero");
        }

        let prefix = this.isNegative ? "-" : "";
        let newExp = exp + 1;
        let newSig = sig.substring(0, sig.length - 1);

        return new Decimal128(`${prefix}${newSig}E${newExp}`);
    }

    private decrementExponent(): Decimal128 {
        let exp = this.exponent;
        let sig = this.significand;

        let prefix = this.isNegative ? "-" : "";
        let newExp = exp - 1;
        let newSig = sig + "0";

        return new Decimal128(`${prefix}${newSig}E${newExp}`);
    }

    private setExponent(newExp: number): Decimal128 {
        let oldExp = this.exponent;
        let result: Decimal128 = this;

        while (oldExp < newExp) {
            result = result.incrementExponent();
            oldExp++;
        }

        while (oldExp > newExp) {
            result = result.decrementExponent();
            oldExp--;
        }

        return result;
    }
}
