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
    significand: bigint;
    exponent: number;
    isNegative: boolean;
    isFinite: boolean;
    isNaN: boolean;
}

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";

function validateConstructorData(x: Decimal128Constructor): void {
    if (x.isNaN || !x.isFinite) {
        return; // no further validation needed
    }

    let numSigDigits = countSignificantDigits(x.significand.toString());

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
        significand: 0n,
        exponent: 0,
        isNegative: false,
        isFinite: true,
        isNaN: true,
    };
}

type SignedSignificandExponent = {
    significand: bigint;
    exponent: number;
    isNegative: boolean;
};

function adjustInteger(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand.toString();
    let m = sig.match(/(0+)$/);

    if (!m) {
        return x;
    }

    let numTrailingZeros = m[0].length;

    return {
        isNegative: x.isNegative,
        significand: BigInt(sig.substring(0, sig.length - numTrailingZeros)),
        exponent: numTrailingZeros,
    };
}

function roundHalfEven(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand.toString();
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
                significand: BigInt(rounded),
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
                significand: BigInt(rounded),
                exponent: exp,
            };
        }

        let rounded =
            cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS - 1) +
            `${penultimateDigit + 1}`;
        return {
            isNegative: x.isNegative,
            significand: BigInt(rounded),
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
                significand: BigInt(rounded),
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
            significand: BigInt(rounded),
            exponent: exp,
        };
    }

    let rounded = cutoffAfterSignificantDigits(sig, MAX_SIGNIFICANT_DIGITS);
    return {
        isNegative: x.isNegative,
        significand: BigInt(rounded),
        exponent: exp,
    };
}

function roundHalfExpand(
    x: SignedSignificandExponent
): SignedSignificandExponent {
    let sig = x.significand.toString();
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
            significand: BigInt(`${cutoff}${finalDigit}`),
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: BigInt(`${rounded}0`),
        exponent: exp,
    };
}

function roundCeiling(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand.toString();
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
        significand: BigInt(`${cutoff}${finalDigit}`),
        exponent: exp,
    };
}

function roundFloor(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand.toString();
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
            significand: BigInt(`${cutoff}${finalDigit}`),
            exponent: exp,
        };
    }

    let rounded = propagateCarryFromRight(cutoff);

    return {
        isNegative: x.isNegative,
        significand: BigInt(`${rounded}0`),
        exponent: exp,
    };
}

function roundTrunc(x: SignedSignificandExponent): SignedSignificandExponent {
    let sig = x.significand.toString();
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
        significand: BigInt(`${cutoff}${finalDigit}`),
        exponent: exp,
    };
}

function adjustNonInteger(
    x: SignedSignificandExponent,
    options: FullySpecifiedConstructorOptions
): SignedSignificandExponent {
    switch (options.roundingMode) {
        case ROUNDING_MODE_CEILING:
            return roundCeiling(x);
        case ROUNDING_MODE_FLOOR:
            return roundFloor(x);
        case ROUNDING_MODE_TRUNCATE:
            return roundTrunc(x);
        case ROUNDING_MODE_HALF_EXPAND:
            return roundHalfExpand(x);
        default:
            return roundHalfEven(x);
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
        significand: BigInt(sg),
        exponent: exp,
        isNaN: false,
        isFinite: true,
    };

    if (numSigDigits <= MAX_SIGNIFICANT_DIGITS) {
        return data;
    }

    if (isInteger) {
        let adjusted = adjustInteger(data);
        return { ...data, ...adjusted };
    }

    let adjusted = adjustNonInteger(data, options);

    return { ...data, ...adjusted };
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

    if ("-." === withoutUnderscores) {
        throw new SyntaxError("Lone minus sign and period not permitted");
    }

    let isNegative = !!withoutUnderscores.match(/^-/);
    let sg = significand(withoutUnderscores);
    let exp = exponent(withoutUnderscores);
    let numSigDigits = countSignificantDigits(withoutUnderscores);
    let isInteger = exp >= 0;

    let data = {
        significand: BigInt(sg),
        exponent: exp,
        isNegative: isNegative,
        isFinite: true,
        isNaN: false,
    };

    if (numSigDigits <= MAX_SIGNIFICANT_DIGITS) {
        return data;
    }

    if (isInteger) {
        let adjusted = adjustInteger(data);
        return { ...data, ...adjusted };
    }

    let adjusted = adjustNonInteger(data, options);

    return { ...data, ...adjusted };
}

function handleInfinity(s: string): Decimal128Constructor {
    return {
        significand: 0n,
        exponent: 0,
        isNegative: !!s.match(/^-/),
        isNaN: false,
        isFinite: false,
    };
}

export const ROUNDING_MODE_CEILING: RoundingMode = "roundTowardPositive";
export const ROUNDING_MODE_FLOOR: RoundingMode = "roundTowardNegative";
export const ROUNDING_MODE_TRUNCATE: RoundingMode = "roundTowardZero";
export const ROUNDING_MODE_HALF_EVEN: RoundingMode = "roundTiesToEven";
export const ROUNDING_MODE_HALF_EXPAND: RoundingMode = "roundTiesToAway";

const ROUNDING_MODE_DEFAULT: RoundingMode = ROUNDING_MODE_HALF_EVEN;

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
        case ROUNDING_MODE_TRUNCATE:
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
    | "roundTowardPositive"
    | "roundTowardNegative"
    | "roundTowardZero"
    | "roundTiesToEven"
    | "roundTiesToAway";

const ROUNDING_MODES: RoundingMode[] = [
    "roundTowardPositive",
    "roundTowardNegative",
    "roundTowardZero",
    "roundTiesToEven",
    "roundTiesToAway",
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
}

const DEFAULT_CONSTRUCTOR_OPTIONS: FullySpecifiedConstructorOptions = {
    roundingMode: ROUNDING_MODE_DEFAULT,
};

type ToStringFormat = "decimal" | "exponential";
const TOSTRING_FORMATS: string[] = ["decimal", "exponential"];

interface ToStringOptions {
    format?: ToStringFormat;
    numDecimalDigits?: number;
    normalize?: boolean;
}

interface FullySpecifiedToStringOptions {
    format: ToStringFormat;
    numDecimalDigits: number | undefined;
    normalize: boolean;
}

const DEFAULT_TOSTRING_OPTIONS: FullySpecifiedToStringOptions = Object.freeze({
    format: "decimal",
    numDecimalDigits: undefined,
    normalize: true,
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

function toRational(isNegative: boolean, sg: bigint, exp: number): Rational {
    if (1n === sg) {
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
    public readonly significand: bigint;
    public readonly exponent: number;
    public readonly isFinite: boolean;
    public readonly isNaN: boolean;
    private readonly isNegative: boolean;
    private readonly rat;

    constructor(n: string | number | bigint, options?: ConstructorOptions) {
        let data = undefined;
        let s = "";

        let fullySpecifiedOptions =
            ensureFullySpecifiedConstructorOptions(options);

        if ("number" === typeof n) {
            s = Object.is(n, -0) ? "-0" : n.toString();
        } else if ("bigint" === typeof n) {
            s = n.toString();
        } else {
            s = n;
        }

        if (s.match(nanRegExp)) {
            data = handleNan();
        } else if (s.match(exponentRegExp)) {
            data = handleExponentialNotation(s, fullySpecifiedOptions);
        } else if (s.match(digitStrRegExp)) {
            data = handleDecimalNotation(s, fullySpecifiedOptions);
        } else if (s.match(infRegExp)) {
            data = handleInfinity(s);
        } else {
            throw new SyntaxError(`Illegal number format "${n}"`);
        }

        validateConstructorData(data);

        this.isNegative = data.isNegative;
        this.exponent = data.exponent;
        this.isNaN = data.isNaN;
        this.significand = data.significand;
        this.isFinite = data.isFinite;

        this.rat =
            this.isFinite && !this.isNaN
                ? toRational(this.isNegative, this.significand, this.exponent)
                : new Rational(0n, 1n);
    }

    private emitExponential(): string {
        let prefix = this.isNegative ? "-" : "";
        let sg = this.significand.toString();
        let exp = this.exponent;

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

    private emitDecimal(options: FullySpecifiedToStringOptions): string {
        let prefix = this.isNegative ? "-" : "";
        let sg = this.significand.toString();
        let exp = this.exponent;
        let isZ = this.isZero();

        if (options.normalize && options.numDecimalDigits === undefined) {
            if (isZ) {
                if (this.isNegative) {
                    return "-0";
                }

                return "0";
            }

            let numFractionalDigits = options.numDecimalDigits;

            let renderedRat = this.rat.toDecimalPlaces(
                numFractionalDigits ?? MAX_SIGNIFICANT_DIGITS
            );

            return ensureDecimalDigits(renderedRat, options.numDecimalDigits);
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

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(opts?: ToStringOptions): string {
        let options = ensureFullySpecifiedToStringOptions(opts);

        if (this.isNaN) {
            return NAN;
        }

        if (!this.isFinite) {
            return (this.isNegative ? "-" : "") + POSITIVE_INFINITY;
        }

        if (options.format === "exponential") {
            return this.emitExponential();
        }

        return this.emitDecimal(options);
    }

    toFixed(n?: number): string
    {
        if (this.isNaN) {
            return NAN;
        }

        if (!this.isFinite) {
            return this.isNegative ? "-" + POSITIVE_INFINITY : POSITIVE_INFINITY;
        }

        if (typeof n === "number" && n < 0) {
            throw new RangeError("Argument must be greater than or equal to 0");
        }

        let numDecimalDigits = n === undefined ? 0 : n;

        if (!Number.isInteger(numDecimalDigits)) {
            numDecimalDigits = Math.floor(numDecimalDigits);
        }

        let opts = ensureFullySpecifiedToStringOptions({ numDecimalDigits });
        return this.round(n).emitDecimal(opts);
    }

    toPrecision(n?: number): string
    {
        return "6";
    }

    toExponential(): string
    {
        return "7";
    }

    private isInteger(): boolean {
        let s = this.toString();

        let [_, rhs] = s.split(/[.]/);

        if (rhs === undefined) {
            return true;
        }

        return !!rhs.match(/^0+$/);
    }

    toBigInt(): bigint {
        if (this.isNaN) {
            throw new RangeError("NaN cannot be converted to a BigInt");
        }

        if (!this.isFinite) {
            throw new RangeError("Infinity cannot be converted to a BigInt");
        }

        if (!this.isInteger()) {
            throw new RangeError(
                "Non-integer decimal cannot be converted to a BigInt"
            );
        }

        return BigInt(this.toString());
    }

    toNumber(): number {
        if (this.isNaN) {
            return NaN;
        }

        if (!this.isFinite) {
            if (this.isNegative) {
                return -Infinity;
            }

            return Infinity;
        }

        return Number(this.toString());
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
    private cmp(x: Decimal128): -1 | 0 | 1 {
        if (this.isNaN || x.isNaN) {
            throw new RangeError("NaN comparison not permitted");
        }

        if (!this.isFinite) {
            if (!x.isFinite) {
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

        if (!x.isFinite) {
            return x.isNegative ? 1 : -1;
        }

        let rationalThis = this.rat;
        let rationalX = x.rat;

        return rationalThis.cmp(rationalX);
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
    compare(x: Decimal128): -1 | 0 | 1 {
        if (this.isNaN) {
            if (x.isNaN) {
                return 0;
            }
            return 1;
        }

        if (x.isNaN) {
            return -1;
        }

        if (!this.isFinite) {
            if (!x.isFinite) {
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

        if (!x.isFinite) {
            return x.isNegative ? 1 : -1;
        }

        if (this.isNegative && !x.isNegative) {
            return -1;
        }

        if (x.isNegative && !this.isNegative) {
            return 1;
        }

        if (this.lessThan(x)) {
            return -1;
        }

        if (x.lessThan(this)) {
            return 1;
        }

        if (this.exponent < x.exponent) {
            return -1;
        }

        if (this.exponent > x.exponent) {
            return 1;
        }

        return 0;
    }

    lessThan(x: Decimal128): boolean {
        return this.cmp(x) === -1;
    }

    equals(x: Decimal128): boolean {
        return this.cmp(x) === 0;
    }

    abs(): Decimal128 {
        if (this.isNaN) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite) {
            if (this.isNegative) {
                return this.neg();
            }

            return this.clone();
        }

        if (this.isNegative) {
            return this.neg();
        }

        return this.clone();
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     */
    add(x: Decimal128): Decimal128 {
        if (this.isNaN || x.isNaN) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite) {
            if (!x.isFinite) {
                if (this.isNegative === x.isNegative) {
                    return x.clone();
                }

                return new Decimal128(NAN);
            }

            return this.clone();
        }

        if (!x.isFinite) {
            return x.clone();
        }

        if (this.isNegative && x.isNegative) {
            return this.neg().add(x.neg()).neg();
        }

        let resultRat = Rational.add(this.rat, x.rat);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1),
            { roundingMode: ROUNDING_MODE_DEFAULT }
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
     */
    subtract(x: Decimal128): Decimal128 {
        if (this.isNaN || x.isNaN) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite) {
            if (!x.isFinite) {
                if (this.isNegative === x.isNegative) {
                    return new Decimal128(NAN);
                }

                return this.clone();
            }

            return this.clone();
        }

        if (!x.isFinite) {
            return x.neg();
        }

        if (x.isNegative) {
            return this.add(x.neg());
        }

        let rendered = Rational.subtract(this.rat, x.rat).toDecimalPlaces(
            MAX_SIGNIFICANT_DIGITS + 1
        );

        let initialResult = new Decimal128(rendered);
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
     */
    multiply(x: Decimal128): Decimal128 {
        if (this.isNaN || x.isNaN) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite) {
            if (x.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative === x.isNegative) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (!x.isFinite) {
            if (this.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative === x.isNegative) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (this.isNegative) {
            return this.neg().multiply(x).neg();
        }

        if (x.isNegative) {
            return this.multiply(x.neg()).neg();
        }

        let resultRat = Rational.multiply(this.rat, x.rat);
        let initialResult = new Decimal128(
            resultRat.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS + 1)
        );
        let adjusted = initialResult.setExponent(this.exponent + x.exponent);

        return new Decimal128(adjusted.toString({ normalize: false }));
    }

    private isZero(): boolean {
        return this.isFinite && !this.isNaN && this.significand === 0n;
    }

    private clone(): Decimal128 {
        return new Decimal128(this.toString());
    }

    /**
     * Divide this Decimal128 value by another Decimal128 value.
     *
     * @param x
     */
    divide(x: Decimal128): Decimal128 {
        if (this.isNaN || x.isNaN) {
            return new Decimal128(NAN);
        }

        if (x.isZero()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite) {
            if (!x.isFinite) {
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

        if (!x.isFinite) {
            if (this.isNegative === x.isNegative) {
                return new Decimal128("0");
            }

            return new Decimal128("-0");
        }

        if (this.isNegative) {
            return this.neg().divide(x).neg();
        }

        if (x.isNegative) {
            return this.divide(x.neg()).neg();
        }

        let adjust = 0;
        let dividendCoefficient = this.significand;
        let divisorCoefficient = x.significand;

        if (dividendCoefficient !== 0n) {
            while (BigInt(dividendCoefficient) < BigInt(divisorCoefficient)) {
                dividendCoefficient = dividendCoefficient * 10n;
                adjust++;
            }
        }

        while (
            BigInt(dividendCoefficient) >=
            BigInt(divisorCoefficient) * 10n
        ) {
            divisorCoefficient *= 10n;
            adjust--;
        }

        let resultCoefficient = 0n;
        let done = false;

        while (!done) {
            while (BigInt(divisorCoefficient) <= BigInt(dividendCoefficient)) {
                dividendCoefficient =
                    BigInt(dividendCoefficient) - BigInt(divisorCoefficient);
                resultCoefficient++;
            }
            if (
                (BigInt(dividendCoefficient) === 0n && adjust >= 0) ||
                resultCoefficient.toString().length > MAX_SIGNIFICANT_DIGITS
            ) {
                done = true;
            } else {
                resultCoefficient = resultCoefficient * 10n;
                dividendCoefficient = dividendCoefficient * 10n;
                adjust++;
            }
        }

        let resultExponent = this.exponent - (x.exponent + adjust);
        return new Decimal128(`${resultCoefficient}E${resultExponent}`);
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
        if (this.isNaN || !this.isFinite) {
            return this.clone();
        }

        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode "${mode}"`);
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

    neg(): Decimal128 {
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
     * @throws RangeError If argument is zero
     */
    remainder(d: Decimal128): Decimal128 {
        if (this.isNaN || d.isNaN) {
            return new Decimal128(NAN);
        }

        if (this.isNegative) {
            return this.neg().remainder(d).neg();
        }

        if (d.isNegative) {
            return this.remainder(d.neg());
        }

        if (!this.isFinite) {
            return new Decimal128(NAN);
        }

        if (!d.isFinite) {
            return this.clone();
        }

        if (this.cmp(d) === -1) {
            return this.clone();
        }

        let q = this.divide(d).round(0, ROUNDING_MODE_TRUNCATE);
        return this.subtract(d.multiply(q));
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

Decimal128.prototype.valueOf = function () {
    throw TypeError("Decimal128.prototype.valueOf throws unconditionally");
};
