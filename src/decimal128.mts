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
        // negative
        return significand(s.substring(1));
    }

    if (s.match(/^00+/)) {
        // leading zeros
        return significand(s.replace(/^00+/, ""));
    }

    if (s.match(/^0+[.]/)) {
        // less than one
        let [_, rhs] = s.split(/[.]/);
        let trailingZeros = rhs.match(/0+$/);
        let withoutTrailingZeros = rhs.replace(/0+$/, "");
        return (
            significand(withoutTrailingZeros) +
            (trailingZeros ? trailingZeros[0] : "")
        );
    }

    if (s.match(/[.]/)) {
        // greater than one
        return s.replace(/[.]/, "");
    }

    // we are dealing with integers at this point

    if (s.match(/^0+/)) {
        // leading zeros
        return significand(s.replace(/^0+/, ""));
    }

    if (s.match(/0+$/)) {
        // trailing zeros
        return significand(s.replace(/0+$/, ""));
    }

    if (s === "") {
        return "0";
    }

    return s;
}

function cutoffAfterSignificantDigits(s: string, n: number): string {
    return s.substring(0, n);
}

function ensureDecimalDigits(s: string, n?: number): string {
    if (s.match(/^-/)) {
        return "-" + ensureDecimalDigits(s.substring(1), n);
    }

    if (undefined === n) {
        return s;
    }

    if (n < 0) {
        return s;
    }

    let [lhs, rhs] = s.split(".");

    if (n === 0) {
        return lhs;
    }

    if (rhs.length >= n) {
        return lhs + "." + rhs.substring(0, n);
    }

    return lhs + "." + rhs + "0".repeat(n - rhs.length);
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

type SignedSignificandExponent = {
    significand: string;
    exponent: number;
    isNegative: boolean;
};

function adjustInteger(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let m = sig.match(/(0+)$/);

    if (!m) {
        return x;
    }

    let numTrailingZeros = m[0].length;

    return {
        isNegative: x.isNegative,
        significand: sig.substring(0, sig.length - numTrailingZeros),
        exponent: numTrailingZeros,
    };
}

function roundHalfEven(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    // original
    if (lastDigit === 5) {
        if (penultimateDigit % 2 === 0) {
            let rounded = cutoffAfterSignificantDigits(
                sig,
                MAX_SIGNIFICANT_DIGITS
            );
            return {
                isNegative: x.isNegative,
                significand: rounded,
                exponent: exp,
            };
        }

        if (9 === penultimateDigit) {
            let carried = propagateCarryFromRight(cutoff);
            let rounded =
                cutoffAfterSignificantDigits(
                    carried,
                    MAX_SIGNIFICANT_DIGITS - 1
                ) + "0";
            return {
                isNegative: x.isNegative,
                significand: rounded,
                exponent: exp,
            };
        }

        let rounded =
            cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1) +
            `${penultimateDigit + 1}`;
        return {
            isNegative: x.isNegative,
            significand: rounded,
            exponent: exp,
        };
    }

    if (lastDigit > 5) {
        if (9 === penultimateDigit) {
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
                isNegative: x.isNegative,
                significand: rounded,
                exponent: exp,
            };
        }

        let nextCutoff = cutoffAfterSignificantDigits(
            sig,
            MAX_SIGNIFICANT_DIGITS
        );
        let rounded = propagateCarryFromRight(nextCutoff);
        return {
            isNegative: x.isNegative,
            significand: rounded,
            exponent: exp,
        };
    }

    let rounded = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS);
    return {
        isNegative: x.isNegative,
        significand: rounded,
        exponent: exp,
    };
}

function roundCeiling(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_CEILING
    );

    return {
        isNegative: x.isNegative,
        significand: `${cutoff}${finalDigit}`,
        exponent: exp,
    };
}

function roundFloor(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_FLOOR
    );

    if (finalDigit < 10) {
        return {
            isNegative: x.isNegative,
            significand: `${cutoff}${finalDigit}`,
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: `${rounded}0`,
        exponent: exp,
    };
}

function roundExpand(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_EXPAND
    );

    if (finalDigit < 10) {
        return {
            isNegative: x.isNegative,
            significand: `${cutoff}${finalDigit}`,
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: `${rounded}0`,
        exponent: exp,
    };
}

function roundTrunc(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_TRUNCATE
    );

    return {
        isNegative: x.isNegative,
        significand: `${cutoff}${finalDigit}`,
        exponent: exp,
    };
}

function roundHalfExpand(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_HALF_EXPAND
    );

    if (finalDigit < 10) {
        return {
            isNegative: x.isNegative,
            significand: `${cutoff}${finalDigit}`,
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: `${rounded}0`,
        exponent: exp,
    };
}

function roundHalfCeil(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_HALF_CEILING
    );

    return {
        isNegative: x.isNegative,
        significand: `${cutoff}${finalDigit}`,
        exponent: exp,
    };
}

function roundHalfFloor(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_HALF_FLOOR
    );

    if (finalDigit < 10) {
        return {
            isNegative: x.isNegative,
            significand: `${cutoff}${finalDigit}`,
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: `${rounded}0`,
        exponent: exp,
    };
}

function roundHalfTrunc(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand;
    let lastDigit = parseInt(sig.charAt(MAX_SIGNIFICANT_DIGITS)) as Digit;
    let cutoff = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1);
    let penultimateDigit = parseInt(
        sig.charAt(MAX_SIGNIFICANT_DIGITS - 1)
    ) as Digit;
    let excessDigits = sig.substring(MAX_SIGNIFICANT_DIGITS);
    let numExcessDigits = excessDigits.length;
    let exp = x.exponent + numExcessDigits; // we will chop off the excess digits

    let finalDigit = roundIt(
        x.isNegative,
        penultimateDigit,
        lastDigit,
        ROUNDING_MODE_HALF_TRUNCATE
    );

    return {
        isNegative: x.isNegative,
        significand: `${cutoff}${finalDigit}`,
        exponent: exp,
    };
}

function adjustNonInteger(
    x: SignedSignificandExponent,
    options: FullySpecifiedConstructorOptions
): SignedSignificandExponent {
    switch (options.roundingMode) {
        case ROUNDING_MODE_HALF_EVEN:
            return roundHalfEven(x);
        case ROUNDING_MODE_CEILING:
            return roundCeiling(x);
        case ROUNDING_MODE_FLOOR:
            return roundFloor(x);
        case ROUNDING_MODE_EXPAND:
            return roundExpand(x);
        case ROUNDING_MODE_TRUNCATE:
            return roundTrunc(x);
        case ROUNDING_MODE_HALF_EXPAND:
            return roundHalfExpand(x);
        case ROUNDING_MODE_HALF_CEILING:
            return roundHalfCeil(x);
        case ROUNDING_MODE_HALF_FLOOR:
            return roundHalfFloor(x);
        case ROUNDING_MODE_HALF_TRUNCATE:
            return roundHalfTrunc(x);
        default:
            throw new Error(
                `Unsupported rounding mode "${options.roundingMode}"`
            );
    }
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

    let data = {
        isNegative: isNegative,
        significand: sg,
        exponent: exp,
    };

    if (numSigDigits <= MAX_SIGNIFICANT_DIGITS) {
        return data;
    }

    if (isInteger) {
        return adjustInteger(data);
    }

    return adjustNonInteger(data, options);
}

function handleDecimalNotation(
    s: string,
    options: FullySpecifiedConstructorOptions
): Decimal128Constructor {
    let withoutLeadingPlus = s.replace(/^\+/, "");
    let withoutUnderscores = withoutLeadingPlus.replace(/_/g, "");

    if ("" === withoutUnderscores) {
        throw new SyntaxError("Empty string not permitted");
    }

    if ("." === withoutUnderscores) {
        throw new SyntaxError("Lone decimal point not permitted");
    }

    if ("-" === withoutUnderscores) {
        throw new SyntaxError("Lone minus sign not permitted");
    }

    let isNegative = !!withoutUnderscores.match(/^-/);
    let sg = significand(withoutUnderscores);
    let exp = exponent(withoutUnderscores);
    let numSigDigits = countSignificantDigits(withoutUnderscores);
    let isInteger = exp >= 0;

    let data = {
        significand: sg,
        exponent: exp,
        isNegative: isNegative,
    };

    if (numSigDigits <= MAX_SIGNIFICANT_DIGITS) {
        return data;
    }

    if (isInteger) {
        return adjustInteger(data);
    }

    return adjustNonInteger(data, options);
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

const ROUNDING_MODE_DEFAULT = ROUNDING_MODE_HALF_EVEN;
const CONSTRUCTOR_SHOULD_NORMALIZE = false;

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

            if (0 === decidingDigit) {
                return digitToRound;
            }

            return (digitToRound + 1) as DigitOrTen;
        case ROUNDING_MODE_FLOOR:
            if (0 === decidingDigit) {
                return digitToRound;
            }

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

const ROUNDING_MODES: RoundingMode[] = [
    "ceil",
    "floor",
    "expand",
    "trunc",
    "halfEven",
    "halfExpand",
    "halfCeil",
    "halfFloor",
    "halfTrunc",
];

const digitStrRegExp =
    /^[+-]?([0-9]+(?:_?[0-9]+)*)?(?:[.]([0-9](_?[0-9]+)*)*)?$/;
const exponentRegExp = /^[+-]?[0-9]+([.][0-9]+)*[eE][-+]?[0-9]+$/;
const nanRegExp = /^-?nan[0-9]*$/i;
const infRegExp = /^-?inf(inity)?$/i;

interface ConstructorOptions {
    roundingMode?: RoundingMode;
}

interface FullySpecifiedConstructorOptions {
    roundingMode: RoundingMode;
    normalize: boolean;
}

const DEFAULT_CONSTRUCTOR_OPTIONS: FullySpecifiedConstructorOptions =
    Object.freeze({
        roundingMode: ROUNDING_MODE_DEFAULT,
        normalize: CONSTRUCTOR_SHOULD_NORMALIZE,
    });

interface ArithmeticOperationOptions {
    roundingMode?: RoundingMode;
}

interface FullySpecifiedArithmeticOperationOptions {
    roundingMode: RoundingMode;
}

const DEFAULT_ARITHMETIC_OPERATION_OPTIONS: FullySpecifiedArithmeticOperationOptions =
    Object.freeze({
        roundingMode: ROUNDING_MODE_DEFAULT,
    });

type ToStringFormat = "decimal" | "exponential";
const TOSTRING_FORMATS: string[] = ["decimal", "exponential"];

interface ToStringOptions {
    format?: ToStringFormat;
    numDecimalDigits?: number;
    normalize?: boolean;
}

interface FullySpecifiedToStringOptions {
    format: string;
    numDecimalDigits: number | undefined;
    normalize: boolean;
}

const DEFAULT_TOSTRING_OPTIONS: FullySpecifiedToStringOptions = Object.freeze({
    format: "decimal",
    numDecimalDigits: undefined,
    normalize: true,
});

interface CmpOptions {
    total?: boolean;
}

interface FullySpecifiedCmpOptions {
    total: boolean;
}

const DEFAULT_CMP_OPTIONS: FullySpecifiedCmpOptions = Object.freeze({
    total: false, // compare by numeric value (ignore trailing zeroes, treat NaN as not-a-number, for a change)
});

function ensureFullySpecifiedConstructorOptions(
    options?: ConstructorOptions
): FullySpecifiedConstructorOptions {
    let opts = { ...DEFAULT_CONSTRUCTOR_OPTIONS };

    if (undefined === options) {
        return opts;
    }

    if (
        "string" === typeof options.roundingMode &&
        ROUNDING_MODES.includes(options.roundingMode)
    ) {
        opts.roundingMode = options.roundingMode;
    }

    return opts;
}

function ensureFullySpecifiedArithmeticOperationOptions(
    options?: ArithmeticOperationOptions
): FullySpecifiedArithmeticOperationOptions {
    let opts = { ...DEFAULT_ARITHMETIC_OPERATION_OPTIONS };

    if (undefined === options) {
        return opts;
    }

    if (
        "string" === typeof options.roundingMode &&
        ROUNDING_MODES.includes(options.roundingMode)
    ) {
        opts.roundingMode = options.roundingMode;
    }

    return opts;
}

function ensureFullySpecifiedToStringOptions(
    options?: ToStringOptions
): FullySpecifiedToStringOptions {
    let opts: FullySpecifiedToStringOptions = { ...DEFAULT_TOSTRING_OPTIONS };

    if (undefined === options) {
        return opts;
    }

    if (
        "string" === typeof options.format &&
        TOSTRING_FORMATS.includes(options.format)
    ) {
        opts.format = options.format;
    }

    if (
        "number" === typeof options.numDecimalDigits &&
        Number.isInteger(options.numDecimalDigits)
    ) {
        opts.numDecimalDigits = options.numDecimalDigits;
    }

    if ("boolean" === typeof options.normalize) {
        opts.normalize = options.normalize;
    }

    return opts;
}

function ensureFullySpecifiedCmpOptions(
    options?: CmpOptions
): FullySpecifiedCmpOptions {
    let opts = { ...DEFAULT_CMP_OPTIONS };

    if (undefined === options) {
        return opts;
    }

    if ("boolean" === typeof options.total) {
        opts.total = options.total;
    }

    return opts;
}

function toRational(isNegative: boolean, sg: string, exp: number): Rational {
    if (sg === NAN || sg === POSITIVE_INFINITY) {
        return new Rational(0n, 1n);
    }

    if ("1" === sg) {
        // power of ten
        if (exp < 0) {
            return new Rational(
                bigOne,
                BigInt((isNegative ? "-" : "") + "1" + "0".repeat(0 - exp))
            );
        }

        if (exp === 0) {
            return new Rational(BigInt(isNegative ? -1 : 1), bigOne);
        }

        return new Rational(
            BigInt((isNegative ? "-" : "") + "1" + "0".repeat(exp)),
            bigOne
        );
    }

    if (exp < 0) {
        return new Rational(
            BigInt((isNegative ? "-" : "") + sg),
            bigTen ** BigInt(0 - exp)
        );
    }

    if (exp === 1) {
        return new Rational(BigInt((isNegative ? "-" : "") + sg + "0"), bigOne);
    }
    return new Rational(
        BigInt((isNegative ? "-" : "") + sg) * 10n ** BigInt(exp),
        bigOne
    );
}

export class Decimal128 {
    private readonly significand: string;
    private readonly exponent: number;
    private readonly isNegative: boolean;
    private readonly rat;

    constructor(n: string, options?: ConstructorOptions) {
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

        this.rat = toRational(this.isNegative, this.significand, this.exponent);
    }

    isNaN(): boolean {
        return this.significand === NAN;
    }

    private isFinite(): boolean {
        let sig = this.significand;
        return sig !== POSITIVE_INFINITY && sig !== NEGATIVE_INFINITY;
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(opts?: ToStringOptions): string {
        let options = ensureFullySpecifiedToStringOptions(opts);

        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative ? "-" : "") + POSITIVE_INFINITY;
        }

        let neg = this.isNegative;
        let prefix = neg ? "-" : "";
        let sg = this.significand;
        let exp = this.exponent;
        let isZ = this.isZero();
        let numFractionalDigits = options.numDecimalDigits;

        if (
            "number" === typeof numFractionalDigits &&
            numFractionalDigits < 0
        ) {
            numFractionalDigits = undefined;
        }

        let renderedRat = this.rat.toDecimalPlaces(
            numFractionalDigits ?? MAX_SIGNIFICANT_DIGITS
        );

        function emitDecimal(): string {
            if (options.normalize && options.numDecimalDigits === undefined) {
                if (isZ) {
                    if (neg) {
                        return "-0";
                    }

                    return "0";
                }
                return ensureDecimalDigits(
                    renderedRat,
                    options.numDecimalDigits
                );
            }

            if (exp >= 0) {
                return ensureDecimalDigits(
                    prefix + sg + "0".repeat(exp),
                    options.numDecimalDigits
                );
            }

            if (sg.length + exp < 0) {
                return ensureDecimalDigits(
                    prefix + "0." + "0".repeat(0 - exp - sg.length) + sg,
                    options.numDecimalDigits
                );
            }

            if (sg.length + exp == 0) {
                return ensureDecimalDigits(
                    prefix + "0." + sg,
                    options.numDecimalDigits
                );
            }

            return ensureDecimalDigits(
                prefix +
                    sg.substring(0, sg.length + exp) +
                    "." +
                    sg.substring(sg.length + exp),
                options.numDecimalDigits
            );
        }

        function emitExponential(): string {
            let adjustedExponent = exp + sg.length - 1;

            if (sg.length === 1) {
                return prefix + sg + "E" + (exp < 0 ? "" : "+") + exp;
            }

            return (
                prefix +
                sg.substring(0, 1) +
                "." +
                sg.substring(1) +
                "E" +
                (adjustedExponent < 0 ? "" : "+") +
                adjustedExponent
            );
        }

        if (options.format === "exponential") {
            return emitExponential();
        }

        return emitDecimal();
    }

    /**
     * Compare two values. Return
     *
     * + -1 if this value is strictly less than the other,
     * + 0 if they are equal, and
     * + 1 otherwise.
     *
     * @param x
     * @param opts
     */
    cmp(x: Decimal128, opts?: CmpOptions): -1 | 0 | 1 | undefined {
        let options = ensureFullySpecifiedCmpOptions(opts);

        if (this.isNaN()) {
            if (options.total) {
                if (x.isNaN()) {
                    return 0;
                }
                return 1;
            }

            return undefined;
        }

        if (x.isNaN()) {
            if (options.total) {
                return -1;
            }

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

        let rationalThis = this.rat;
        let rationalX = x.rat;

        let ratCmp = rationalThis.cmp(rationalX);

        if (ratCmp !== 0) {
            return ratCmp;
        }

        if (!options.total) {
            return 0;
        }

        if (this.isNegative && !x.isNegative) {
            return -1;
        }

        if (!this.isNegative && x.isNegative) {
            return 1;
        }

        let renderedThis = this.toString({
            format: "decimal",
            normalize: false,
        });
        let renderedX = x.toString({ format: "decimal", normalize: false });

        if (renderedThis === renderedX) {
            return 0;
        }

        return renderedThis > renderedX ? -1 : 1;
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     * @param opts
     */
    add(x: Decimal128, opts?: ArithmeticOperationOptions): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative === x.isNegative) {
                    return x.clone();
                }

                return new Decimal128(NAN);
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.clone();
        }

        if (this.isNegative && x.isNegative) {
            return this.negate().add(x.negate(), opts).negate();
        }

        let resultRat = Rational.add(this.rat, x.rat);
        let options = ensureFullySpecifiedArithmeticOperationOptions(opts);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            { roundingMode: options.roundingMode }
        );
        let adjusted = initialResult.setExponent(
            Math.min(this.exponent, x.exponent)
        );

        return new Decimal128(adjusted.toString({ normalize: false }));
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     * @param opts
     */
    subtract(x: Decimal128, opts?: ArithmeticOperationOptions): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative === x.isNegative) {
                    return new Decimal128(NAN);
                }

                return this.clone();
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.negate();
        }

        if (x.isNegative) {
            return this.add(x.negate());
        }

        let rendered = Rational.subtract(this.rat, x.rat).toDecimalPlaces(
            MAX_SIGNIFICANT_DIGITS + 1
        );

        let options = ensureFullySpecifiedArithmeticOperationOptions(opts);

        let initialResult = new Decimal128(rendered, options);
        let adjusted = initialResult.setExponent(
            Math.min(this.exponent, x.exponent)
        );
        return new Decimal128(adjusted.toString({ normalize: false }));
    }

    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     * @param opts
     */
    multiply(x: Decimal128, opts?: ArithmeticOperationOptions): Decimal128 {
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
            return this.negate().multiply(x).negate();
        }

        if (x.isNegative) {
            return this.multiply(x.negate()).negate();
        }

        let resultRat = Rational.multiply(this.rat, x.rat);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            ensureFullySpecifiedArithmeticOperationOptions(opts)
        );
        let adjusted = initialResult.setExponent(this.exponent + x.exponent);

        return new Decimal128(adjusted.toString({ normalize: false }));
    }

    private isZero(): boolean {
        return this.isFinite() && !!this.significand.match(/^0+$/);
    }

    private clone(): Decimal128 {
        return new Decimal128(this.toString());
    }

    /**
     * Divide this Decimal128 value by an array of other Decimal128 values.
     *
     * Association is to the left: 1/2/3 is (1/2)/3
     *
     * If only one argument is given, just return the first argument.
     *
     * @param x
     * @param opts
     */
    divide(x: Decimal128, opts?: ArithmeticOperationOptions): Decimal128 {
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
                return this.clone();
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
            return this.negate().divide(x).negate();
        }

        if (x.isNegative) {
            return this.divide(x.negate()).negate();
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
            ensureFullySpecifiedArithmeticOperationOptions(opts)
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
        if (this.isNaN() || !this.isFinite()) {
            return this.clone();
        }

        if (numDecimalDigits < 0) {
            numDecimalDigits = 0;
        }

        let s = this.toString({ normalize: false });
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

        if (Number.isNaN(firstDecimalDigit)) {
            firstDecimalDigit = 0;
        }

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

    private negate(): Decimal128 {
        let s = this.toString({ normalize: false });

        if (s.match(/^-/)) {
            return new Decimal128(s.substring(1));
        }

        return new Decimal128("-" + s);
    }

    /**
     * Return the remainder of this Decimal128 value divided by another Decimal128 value.
     *
     * @param d
     * @param opts
     * @throws RangeError If argument is zero
     */
    remainder(d: Decimal128, opts?: ArithmeticOperationOptions): Decimal128 {
        if (this.isNaN() || d.isNaN()) {
            return new Decimal128(NAN);
        }

        if (this.isNegative) {
            return this.negate().remainder(d).negate();
        }

        if (d.isNegative) {
            return this.remainder(d.negate());
        }

        if (!this.isFinite()) {
            return new Decimal128(NAN);
        }

        if (!d.isFinite()) {
            return this.clone();
        }

        if (this.cmp(d) === -1) {
            return this.clone();
        }

        let q = this.divide(d).round(0, ROUNDING_MODE_TRUNCATE);
        return this.subtract(d.multiply(q), opts);
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

        while (oldExp > newExp) {
            result = result.decrementExponent();
            oldExp--;
        }

        return result;
    }
}
