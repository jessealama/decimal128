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

import { Digit, DigitOrTen } from "./common.mjs";
import { Rational } from "./rational.mjs";

const EXPONENT_MIN = -6176;
const EXPONENT_MAX = 6111;
const MAX_SIGNIFICANT_DIGITS = 34;

const bigTen = BigInt(10);
const bigOne = BigInt(1);

function cohort(s: string): Rational {
    return Rational.fromString(s);
}

function quantum(s: string): number {
    if (s.match(/^-/)) {
        return quantum(s.substring(1));
    }

    if (s.match(/^[0-9]+/)) {
        return 0;
    }

    if (s.match(/^[0-9]+[eE][+-]?[0-9]+/)) {
        let exp = parseInt(s.split(/[eE]/)[1]);
        return 0 - exp;
    }

    if (s.match(/[.]/)) {
        let [lhs, rhs] = s.split(".");
        if (s.match(/[eE]/)) {
            let beforeExp = lhs.split(/[eE]/)[0];
            return beforeExp.length;
        }

        return rhs.length;
    }

    throw new SyntaxError(`Cannot determine quantum for "${s}"`);
}

type NaNValue = "NaN";

type InfiniteValue = "Infinity" | "-Infinity";

interface FiniteValue {
    cohort: "0" | "-0" | Rational;
    quantum: number;
}

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";
const TEN_MAX_EXPONENT = new Rational(bigTen, bigOne).scale10(EXPONENT_MAX);

function pickQuantum(d: Rational, preferredQuantum: number): number {
    return preferredQuantum;
}

function validateConstructorData(x: Decimal128Value): void {
    if ((x as NaNValue) !== undefined) {
        return; // no further validation needed
    }

    if ((x as InfiniteValue) !== undefined) {
        return; // no further validation needed
    }

    let val = x as FiniteValue;
    let v = val.cohort;
    let q = val.quantum;

    if (q > EXPONENT_MAX) {
        throw new RangeError(`Quantum too big (${q})`);
    }

    if (q < EXPONENT_MIN) {
        throw new RangeError(`Quantum too small (${q})`);
    }

    if (v === "0" || v === "-0") {
        return; // no further validation needed
    }

    let scaledV = v.scale10(0 - q);

    if (!scaledV.isInteger()) {
        throw new RangeError(
            `Scaled value is not an integer (v = ${v}, q = ${q})`
        );
    }

    let absV = scaledV.abs();

    if (absV.isZero()) {
        throw new RangeError(`Absolute value of scaled cohort is zero`);
    }

    if (absV.cmp(TEN_MAX_EXPONENT) > 0) {
        throw new RangeError(`Absolute value of scaled cohort is too big`);
    }

    return;
}

function handleDecimalNotation(s: string): Decimal128Value {
    if (s === "NaN") {
        return "NaN";
    }

    if (s.match(/^-?Infinity$/)) {
        return s.match(/^-/) ? "-Infinity" : "Infinity";
    }

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

    let v = cohort(withoutUnderscores);
    let q = quantum(withoutUnderscores);

    return {
        quantum: q,
        cohort: v,
    };
}

export const ROUNDING_MODE_CEILING: RoundingMode = "ceil";
export const ROUNDING_MODE_FLOOR: RoundingMode = "floor";
export const ROUNDING_MODE_TRUNCATE: RoundingMode = "trunc";
export const ROUNDING_MODE_HALF_EVEN: RoundingMode = "halfEven";
export const ROUNDING_MODE_HALF_EXPAND: RoundingMode = "halfExpand";

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

type RoundingMode = "ceil" | "floor" | "trunc" | "halfEven" | "halfExpand";

const ROUNDING_MODES: RoundingMode[] = [
    "ceil",
    "floor",
    "trunc",
    "halfEven",
    "halfExpand",
];

export class Decimal128 {
    private readonly cohort:
        | "NaN"
        | "Infinity"
        | "-Infinity"
        | "0"
        | "-0"
        | Rational;
    private readonly quantum: undefined | number;

    constructor(
        n: string | number | bigint | { cohort: Rational; quantum: number }
    ) {
        if ("object" === typeof n) {
            validateConstructorData(n);
            this.cohort = n.cohort;
            this.quantum = n.quantum;
        } else {
            let s: string;

            if ("number" === typeof n) {
                s = Object.is(n, -0) ? "-0" : n.toString();
            } else if ("bigint" === typeof n) {
                s = n.toString();
            } else {
                s = n;
            }

            let data = handleDecimalNotation(s);

            validateConstructorData(data);

            if (data === "NaN" || data === "Infinity" || data === "-Infinity") {
                this.cohort = data;
                this.quantum = undefined;
            } else {
                this.cohort = data.cohort;
                this.quantum = data.quantum;
            }
        }
    }

    public static fromCohortAndQuantum(v: Rational, q: number): Decimal128 {
        return new Decimal128({ cohort: v, quantum: q });
    }

    public static fromRational(r: Rational): Decimal128 {
        return new Decimal128(r.toString());
    }

    public isNaN(): boolean {
        return this.cohort === "NaN";
    }

    public isFinite(): boolean {
        let v = this.cohort;
        return v instanceof Rational || v === "0" || v === "-0";
    }

    public isNegative(): boolean {
        let v = this.cohort;
        if (v instanceof Rational) {
            return v.isNegative;
        }

        return v === "-0" || v === "-Infinity";
    }

    private isZero(): boolean {
        if (this.isNaN()) {
            return false;
        }

        if (!this.isFinite()) {
            return false;
        }

        let v = this.cohort;

        return v === "0" || v === "-0";
    }

    private significandAndExponent(): [Rational, number] {
        if (!this.isFinite()) {
            throw new RangeError("Infinity does not have a significand");
        }

        if (this.isZero()) {
            throw new RangeError("Zero does not have a significand");
        }

        if (this.isNegative()) {
            let [s, e] = this.neg().significandAndExponent();
            return [s.negate(), e];
        }

        let v = this.cohort as Rational;
        let q = this.quantum as number;
        let s = v;
        let e = q;
        const ratTen = new Rational(bigTen, bigOne);
        const ratOne = new Rational(bigOne, bigOne);

        while (s.cmp(ratOne) < 0) {
            s = s.scale10(1);
            e++;
        }

        while (s.cmp(ratTen) >= 0) {
            s = s.scale10(-1);
            e--;
        }

        return [s, e];
    }

    public exponent(): number {
        let [_, e] = this.significandAndExponent();
        return e;
    }

    public mantissa(): Decimal128 {
        let [sig, _] = this.significandAndExponent();
        return new Decimal128(sig.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS));
    }

    public scale10(n: number): Decimal128 {
        if (this.isNaN()) {
            throw new RangeError("NaN cannot be scaled");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity cannot be scaled");
        }

        if (!Number.isInteger(n)) {
            throw new TypeError("Argument must be an integer");
        }

        if (n === 0) {
            return this.clone();
        }

        let v = this.cohort as Rational;
        let q = this.quantum as number;

        return Decimal128.fromCohortAndQuantum(v.scale10(n), q - n);
    }

    private significand(): Rational {
        let [s, _] = this.significandAndExponent();
        return s;
    }

    private emitExponential(): string {
        let prefix = this.isNegative() ? "-" : "";
        let sg = this.significand().toString();
        let exp = this.exponent();

        let adjustedExponent = exp + sg.length - 1;

        if (sg.length === 1) {
            return prefix + sg + "e" + (exp < 0 ? "" : "+") + exp;
        }

        return (
            prefix +
            sg.substring(0, 1) +
            "." +
            sg.substring(1) +
            "e" +
            (adjustedExponent < 0 ? "" : "+") +
            adjustedExponent
        );
    }

    private emitDecimal(): string {
        let v = this.cohort as Rational;
        return v.toDecimalPlaces(MAX_SIGNIFICANT_DIGITS);
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + POSITIVE_INFINITY;
        }

        let asDecimalString = this.emitDecimal();

        if (asDecimalString.length > 20) {
            return this.emitExponential();
        }

        return asDecimalString;
    }

    toFixed(opts?: { digits?: number }): string {
        if (undefined === opts) {
            return this.toString();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.toString();
        }

        let n = opts.digits;

        if (n < 0) {
            throw new RangeError("Argument must be greater than or equal to 0");
        }

        if (!Number.isInteger(n)) {
            throw new RangeError("Argument must be an integer");
        }

        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return this.isNegative()
                ? "-" + POSITIVE_INFINITY
                : POSITIVE_INFINITY;
        }

        return this.round(n).emitDecimal();
    }

    toPrecision(opts?: { digits?: number }): string {
        if (undefined === opts) {
            return this.toString();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.toString();
        }

        let n = opts.digits;

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        if (!Number.isInteger(n)) {
            throw new RangeError("Argument must be an integer");
        }

        if (this.isNaN()) {
            return "NaN";
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + "Infinity";
        }

        let s = this.abs().emitDecimal();

        let [lhs, rhs] = s.split(/[.]/);
        let p = this.isNegative() ? "-" : "";

        if (n <= lhs.length) {
            if (lhs.match(/[.]$/)) {
                lhs = lhs.substring(0, n);
            }

            if (lhs.length === n) {
                return p + lhs;
            }

            if (1 === n) {
                return p + s.substring(0, 1) + "e+" + `${lhs.length - n}`;
            }

            return (
                p +
                s.substring(0, 1) +
                "." +
                s.substring(1, n) +
                "e+" +
                `${lhs.length - n + 1}`
            );
        }

        if (n <= lhs.length + rhs.length) {
            return p + s.substring(0, n + 1); // plus one because of the decimal point
        }

        return p + lhs + "." + rhs + "0".repeat(n - lhs.length - rhs.length);
    }

    toExponential(opts?: { digits?: number }): string {
        if (this.isNaN()) {
            return "NaN";
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + "Infinity";
        }

        if (undefined === opts) {
            return this.emitExponential();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.emitExponential();
        }

        let n = opts.digits;

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        if (!Number.isInteger(n)) {
            throw new RangeError("Argument must be an integer");
        }

        let s = this.abs().emitExponential();

        let [lhs, rhsWithEsign] = s.split(/[.]/);

        let [rhs, exp] = rhsWithEsign.split(/[eE]/);

        let p = this.isNegative() ? "-" : "";

        if (rhs.length <= n) {
            return p + lhs + "." + rhs + "0".repeat(n - rhs.length) + "e" + exp;
        }

        return p + lhs + "." + rhs.substring(0, n) + "e" + exp;
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
        if (this.isNaN()) {
            throw new RangeError("NaN cannot be converted to a BigInt");
        }

        if (!this.isFinite()) {
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
        if (this.isNaN()) {
            return NaN;
        }

        if (!this.isFinite()) {
            if (this.isNegative()) {
                return -Infinity;
            }

            return Infinity;
        }

        return Number(this.toString());
    }

    /**
     * Compare two values. Return
     *
     * * NaN if either argument is a decimal NaN
     * + -1 if the mathematical value of this decimal is strictly less than that of the other,
     * + 0 if the mathematical values are equal, and
     * + 1 otherwise.
     *
     * @param x
     */
    private cmp(x: Decimal128): number {
        if (this.isNaN() || x.isNaN()) {
            return NaN;
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return 0;
                }

                return this.isNegative() ? -1 : 1;
            }

            if (this.isNegative()) {
                return -1;
            }

            return 1;
        }

        if (!x.isFinite()) {
            return x.isNegative() ? 1 : -1;
        }

        let ourCohort = this.cohort as Rational;
        let theirCohort = x.cohort as Rational;

        return ourCohort.cmp(theirCohort);
    }

    lessThan(x: Decimal128): boolean {
        return this.cmp(x) === -1;
    }

    equals(x: Decimal128): boolean {
        return this.cmp(x) === 0;
    }

    abs(): Decimal128 {
        if (this.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (this.isNegative()) {
                return this.neg();
            }

            return this.clone();
        }

        if (this.isNegative()) {
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
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return x.clone();
                }

                return new Decimal128(NAN);
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.clone();
        }

        if (this.isNegative() && x.isNegative()) {
            return this.neg().add(x.neg()).neg();
        }

        let ourCohort = this.cohort as Rational;
        let theirCohort = x.cohort as Rational;
        let ourQuantum = this.quantum as number;
        let theirQuantum = x.quantum as number;
        let sum = Rational.add(ourCohort, theirCohort);
        let prefferedQuantum = Math.min(ourQuantum, theirQuantum);

        return Decimal128.fromCohortAndQuantum(
            sum,
            pickQuantum(sum, prefferedQuantum)
        );
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     */
    subtract(x: Decimal128): Decimal128 {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return new Decimal128(NAN);
                }

                return this.clone();
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.neg();
        }

        if (x.isNegative()) {
            return this.add(x.neg());
        }

        if (this.isZero()) {
            return x.neg();
        }

        if (x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.cohort as Rational;
        let theirCohort = x.cohort as Rational;
        let ourExponent = this.quantum as number;
        let theirExponent = x.quantum as number;
        let difference = Rational.subtract(ourCohort, theirCohort);
        let prefferedExponent = Math.min(ourExponent, theirExponent);

        return Decimal128.fromCohortAndQuantum(
            difference,
            pickQuantum(difference, prefferedExponent)
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
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (x.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isZero()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (this.isNegative()) {
            return this.neg().multiply(x).neg();
        }

        if (x.isNegative()) {
            return this.multiply(x.neg()).neg();
        }

        if (this.isZero() || x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.cohort as Rational;
        let theirCohort = x.cohort as Rational;
        let ourExponent = this.quantum as number;
        let theirExponent = x.quantum as number;
        let product = Rational.multiply(ourCohort, theirCohort);
        let prefferedExponent = ourExponent + theirExponent;

        return Decimal128.fromCohortAndQuantum(
            product,
            pickQuantum(product, prefferedExponent)
        );
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
        if (this.isNaN() || x.isNaN()) {
            return new Decimal128(NAN);
        }

        if (this.isZero()) {
            return this.clone();
        }

        if (x.isZero()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                return new Decimal128(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal128(POSITIVE_INFINITY);
            }

            if (this.isNegative()) {
                return this.clone();
            }

            return new Decimal128(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isNegative() === x.isNegative()) {
                return new Decimal128("0");
            }

            return new Decimal128("-0");
        }

        if (this.isNegative()) {
            return this.neg().divide(x).neg();
        }

        if (x.isNegative()) {
            return this.divide(x.neg()).neg();
        }

        let adjust = 0;
        let dividendCoefficient = this.significand();
        let divisorCoefficient = x.significand();

        if (!dividendCoefficient.isZero()) {
            while (dividendCoefficient.cmp(divisorCoefficient) === -1) {
                dividendCoefficient = dividendCoefficient.scale10(1);
                adjust++;
            }
        }

        while (dividendCoefficient.cmp(divisorCoefficient.scale10(1))) {
            divisorCoefficient = divisorCoefficient.scale10(1);
            adjust--;
        }

        let resultCoefficient = 0n;
        let done = false;

        while (!done) {
            while (divisorCoefficient.cmp(dividendCoefficient) <= 0) {
                dividendCoefficient = Rational.subtract(
                    dividendCoefficient,
                    divisorCoefficient
                );
                resultCoefficient++;
            }
            if (
                (dividendCoefficient.isZero() && adjust >= 0) ||
                resultCoefficient.toString().length > MAX_SIGNIFICANT_DIGITS
            ) {
                done = true;
            } else {
                resultCoefficient = resultCoefficient * 10n;
                dividendCoefficient = dividendCoefficient.scale10(1);
                adjust++;
            }
        }

        let resultExponent = this.exponent() - (x.exponent() + adjust);
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
        if (this.isNaN() || !this.isFinite()) {
            return this.clone();
        }

        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode "${mode}"`);
        }

        if (numDecimalDigits < 0) {
            numDecimalDigits = 0;
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

        if (Number.isNaN(firstDecimalDigit)) {
            firstDecimalDigit = 0;
        }

        let roundedFinalDigit = roundIt(
            this.isNegative(),
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
        if (this.isNaN()) {
            return this.clone();
        }

        if (!this.isFinite()) {
            return new Decimal128(
                this.isNegative() ? POSITIVE_INFINITY : NEGATIVE_INFINITY
            );
        }

        let v = this.cohort;

        if (v === "0") {
            return new Decimal128("-0");
        }

        if (v === "-0") {
            return new Decimal128("0");
        }

        return Decimal128.fromCohortAndQuantum(
            (v as Rational).negate(),
            this.quantum as number
        );
    }

    /**
     * Return the remainder of this Decimal128 value divided by another Decimal128 value.
     *
     * @param d
     * @throws RangeError If argument is zero
     */
    remainder(d: Decimal128): Decimal128 {
        if (this.isNaN() || d.isNaN()) {
            return new Decimal128(NAN);
        }

        if (this.isNegative()) {
            return this.neg().remainder(d).neg();
        }

        if (d.isNegative()) {
            return this.remainder(d.neg());
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
        return this.subtract(d.multiply(q));
    }
}

Decimal128.prototype.valueOf = function () {
    throw TypeError("Decimal128.prototype.valueOf throws unconditionally");
};
