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

import { RoundingMode, ROUNDING_MODES } from "./common.mjs";
import { Rational } from "./Rational.mjs";
import { Decimal } from "./Decimal.mjs";

const EXPONENT_MIN = -6176;
const EXPONENT_MAX = 6111;
const MAX_SIGNIFICANT_DIGITS = 34;

const bigTen = BigInt(10);
const bigOne = BigInt(1);
const ratOne = new Rational(1n, 1n);
const ratTen = new Rational(10n, 1n);

type NaNValue = "NaN";
type InfiniteValue = "Infinity" | "-Infinity";
type FiniteValue = Decimal;

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";
const TEN_MAX_EXPONENT = new Rational(
    bigTen ** BigInt(MAX_SIGNIFICANT_DIGITS),
    bigOne
);

function pickQuantum(d: Rational, preferredQuantum: number): number {
    return preferredQuantum;
}

function adjustDecimal128(v: Rational, q: number): Decimal {
    if (v.isNegative) {
        return adjustDecimal128(v.negate(), q).negate();
    }

    let x = new Decimal({ cohort: v, quantum: q });

    if (
        v
            .abs()
            .scale10(0 - q)
            .cmp(TEN_MAX_EXPONENT) <= 0
    ) {
        return x;
    }

    if (v.isInteger()) {
        let tenth = v.scale10(-1);
        if (tenth.isInteger()) {
            return adjustDecimal128(tenth, q + 1);
        }

        throw new RangeError("Integer too large");
    }

    let sig = x.significand();
    let exp = x.exponent();

    let scaledSig = sig.scale10(MAX_SIGNIFICANT_DIGITS - 1);
    let rounded = scaledSig.round(0, "halfEven");
    return new Decimal({
        cohort: rounded.scale10(0 - MAX_SIGNIFICANT_DIGITS + exp + 1),
        quantum: 0 - MAX_SIGNIFICANT_DIGITS + exp,
    });
}

function validateConstructorData(x: Decimal128Value): Decimal128Value {
    if (x === "NaN" || x === "Infinity" || x === "-Infinity") {
        return x; // no further validation needed
    }

    let val = x as FiniteValue;

    let v = val.cohort;
    let q = val.quantum;

    if (q > EXPONENT_MAX) {
        if (v === "0" || v === "-0") {
            return new Decimal({ cohort: v, quantum: EXPONENT_MAX });
        }

        throw new RangeError(`Quantum too big (${q})`);
    }

    if (q < EXPONENT_MIN) {
        if (v === "0" || v === "-0") {
            return new Decimal({ cohort: v, quantum: EXPONENT_MIN });
        }

        throw new RangeError(`Quantum too small (${q})`);
    }

    if (v === "0" || v === "-0") {
        return x;
    }

    return adjustDecimal128(v, q);
}

function handleDecimalNotation(s: string): Decimal128Value {
    if (s.match(/^[+]/)) {
        return handleDecimalNotation(s.substring(1));
    }

    if (s.match(/_/)) {
        return handleDecimalNotation(s.replace(/_/g, ""));
    }

    if ("" === s) {
        throw new SyntaxError("Empty string not permitted");
    }

    if ("." === s) {
        throw new SyntaxError("Lone decimal point not permitted");
    }

    if ("-" === s) {
        throw new SyntaxError("Lone minus sign not permitted");
    }

    if ("-." === s) {
        throw new SyntaxError("Lone minus sign and period not permitted");
    }

    if (s === "NaN") {
        return "NaN";
    }

    if (s.match(/^-?Infinity$/)) {
        return s.match(/^-/) ? "-Infinity" : "Infinity";
    }

    return new Decimal(s);
}

export const ROUNDING_MODE_CEILING: RoundingMode = "ceil";
export const ROUNDING_MODE_FLOOR: RoundingMode = "floor";
export const ROUNDING_MODE_TRUNCATE: RoundingMode = "trunc";
export const ROUNDING_MODE_HALF_EVEN: RoundingMode = "halfEven";
export const ROUNDING_MODE_HALF_EXPAND: RoundingMode = "halfExpand";

const ROUNDING_MODE_DEFAULT: RoundingMode = ROUNDING_MODE_HALF_EVEN;

export class Decimal128 {
    private readonly d: Decimal | undefined = undefined;
    private readonly _isNaN: boolean = false;
    private readonly _isFinite: boolean = true;
    private readonly _isNegative: boolean = false;

    constructor(n: string | number | bigint | Decimal) {
        let data;
        if ("object" === typeof n) {
            data = n;
        } else {
            let s: string;

            if ("number" === typeof n) {
                s = Object.is(n, -0) ? "-0" : n.toString();
            } else if ("bigint" === typeof n) {
                s = n.toString();
            } else {
                s = n;
            }

            data = handleDecimalNotation(s);
        }

        data = validateConstructorData(data);

        if (data == "NaN") {
            this._isNaN = true;
        } else if (data == "Infinity") {
            this._isFinite = false;
        } else if (data == "-Infinity") {
            this._isFinite = false;
            this._isNegative = true;
        } else {
            let v = data.cohort;
            if (v === "-0") {
                this._isNegative = true;
            } else if (v === "0") {
                this._isNegative = false;
            } else {
                this._isNegative = v.isNegative;
            }
            this.d = data;
        }
    }

    public isNaN(): boolean {
        return this._isNaN;
    }

    public isFinite(): boolean {
        return this._isFinite;
    }

    public isNegative(): boolean {
        return this._isNegative;
    }

    private cohort(): "0" | "-0" | Rational {
        let d = this.d;
        if (d instanceof Decimal) {
            return d.cohort;
        }

        throw new TypeError("Cannot compute cohort of a non-finite number");
    }

    private quantum(): number {
        let d = this.d;

        if (d instanceof Decimal) {
            return d.quantum;
        }

        throw new TypeError("Cannot compute quantum of a non-finite number");
    }

    private isZero(): boolean {
        if (this.isNaN()) {
            return false;
        }

        if (!this.isFinite()) {
            return false;
        }

        let v = this.cohort();

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

        let v = this.cohort() as Rational;
        let q = this.quantum() as number;
        let s = v;
        let e = q;

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
        let mantissa = this.mantissa();
        let mantissaQuantum = mantissa.quantum();
        let ourQuantum = this.quantum();
        return ourQuantum - mantissaQuantum;
    }

    public mantissa(): Decimal128 {
        if (this.isZero()) {
            throw new RangeError("Zero does not have a mantissa");
        }

        if (this.isNegative()) {
            return this.neg().mantissa().neg();
        }

        let x: Decimal128 = this;
        let decimalOne = new Decimal128("1");
        let decimalTen = new Decimal128("10");

        while (0 <= x.cmp(decimalTen)) {
            x = x.scale10(-1);
        }

        while (x.cmp(decimalOne) === -1) {
            x = x.scale10(1);
        }

        return x;
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

        let v = this.cohort() as Rational;
        let q = this.quantum() as number;

        return new Decimal128(
            new Decimal({ cohort: v.scale10(n), quantum: q + n })
        );
    }

    private significand(): bigint {
        if (this.isZero()) {
            throw new RangeError("Zero does not have a significand");
        }

        let d = this.d as Decimal;
        return d.coefficient();
    }

    private emitExponential(): string {
        let v = this.cohort();
        let q = this.quantum();
        let p = this._isNegative ? "-" : "";

        if (v === "0" || v === "-0") {
            if (q < 0) {
                return p + v + "." + "0".repeat(0 - q);
            }

            return v;
        }

        let m = this.mantissa();
        let e = this.exponent();
        let mAsString = m.toFixed({ digits: Infinity });
        let expPart = (e < 0 ? "-" : "+") + Math.abs(e);
        return p + mAsString + "e" + expPart;
    }

    private emitDecimal(): string {
        let v = this.cohort();
        let q = this.quantum();

        if (v === "0") {
            if (q < 0) {
                return "0" + "." + "0".repeat(0 - q);
            }

            return "0";
        }

        if (v === "-0") {
            if (q < 0) {
                return "-0" + "." + "0".repeat(0 - q);
            }

            return "-0";
        }

        let c = v.scale10(0 - q);

        if (!c.isInteger()) {
            throw new TypeError("The coefficient is not an integer.");
        }

        let s = c.numerator.toString();
        let p = this._isNegative ? "-" : "";

        if (q > 0) {
            return p + s + "0".repeat(q);
        }

        if (q === 0) {
            return p + s;
        }

        if (s.length < Math.abs(q)) {
            let numZeroesNeeded = Math.abs(q) - s.length;
            return p + "0." + "0".repeat(numZeroesNeeded) + s;
        }

        let integerPart = s.substring(0, s.length + q);
        let fractionalPart = s.substring(s.length + q);

        if (integerPart === "") {
            integerPart = "0";
        }

        return p + integerPart + "." + fractionalPart;
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(opts?: { preserveTrailingZeroes?: boolean }): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + POSITIVE_INFINITY;
        }

        let preserveTrailingZeroes = false;

        if (
            "object" === typeof opts &&
            "boolean" === typeof opts.preserveTrailingZeroes
        ) {
            preserveTrailingZeroes = opts.preserveTrailingZeroes;
        }

        let asDecimalString = this.emitDecimal();

        if (!preserveTrailingZeroes && asDecimalString.match(/[.]/)) {
            asDecimalString = asDecimalString.replace(/0+$/, "");
            if (asDecimalString === "") {
                asDecimalString = "0";
            } else if (asDecimalString === "-") {
                asDecimalString = "-0";
            } else if (asDecimalString.match(/[.]$/)) {
                asDecimalString = asDecimalString.substring(
                    0,
                    asDecimalString.length - 1
                );
            }
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

        if (n === Infinity) {
            return this.emitDecimal();
        }

        if (!Number.isInteger(n)) {
            throw new RangeError(
                "Argument must be an integer or positive infinity"
            );
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
    cmp(x: Decimal128): number {
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

        if (this.isZero()) {
            if (x.isZero()) {
                return 0;
            }

            return x.isNegative() ? 1 : -1;
        }

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;

        return ourCohort.cmp(theirCohort);
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

        if (this.isZero()) {
            return x.clone();
        }

        if (x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;
        let ourQuantum = this.quantum() as number;
        let theirQuantum = x.quantum() as number;
        let sum = Rational.add(ourCohort, theirCohort);
        let preferredQuantum = Math.min(ourQuantum, theirQuantum);

        if (sum.isZero()) {
            if (this._isNegative) {
                return new Decimal128("-0");
            }

            return new Decimal128("0");
        }

        return new Decimal128(
            new Decimal({
                cohort: sum,
                quantum: pickQuantum(sum, preferredQuantum),
            })
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

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;
        let ourExponent = this.quantum() as number;
        let theirExponent = x.quantum() as number;
        let difference = Rational.subtract(ourCohort, theirCohort);
        let preferredQuantum = Math.min(ourExponent, theirExponent);

        return new Decimal128(
            new Decimal({
                cohort: difference,
                quantum: pickQuantum(difference, preferredQuantum),
            })
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

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;
        let ourExponent = this.quantum() as number;
        let theirExponent = x.quantum() as number;
        let product = Rational.multiply(ourCohort, theirCohort);
        let preferredQuantum = ourExponent + theirExponent;

        return new Decimal128(
            new Decimal({
                cohort: product,
                quantum: pickQuantum(product, preferredQuantum),
            })
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

        if (dividendCoefficient !== 0n) {
            while (dividendCoefficient < divisorCoefficient) {
                dividendCoefficient = dividendCoefficient * 10n;
                adjust++;
            }
        }

        while (dividendCoefficient > divisorCoefficient * 10n) {
            divisorCoefficient = divisorCoefficient * 10n;
            adjust--;
        }

        let resultCoefficient = 0n;
        let done = false;

        while (!done) {
            while (divisorCoefficient <= dividendCoefficient) {
                dividendCoefficient = dividendCoefficient - divisorCoefficient;
                resultCoefficient++;
            }
            if (
                (dividendCoefficient === 0n && adjust >= 0) ||
                resultCoefficient.toString().length > MAX_SIGNIFICANT_DIGITS
            ) {
                done = true;
            } else {
                resultCoefficient = resultCoefficient * 10n;
                dividendCoefficient = dividendCoefficient * 10n;
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
        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode "${mode}"`);
        }

        if (this.isNaN() || !this.isFinite()) {
            return this.clone();
        }

        if (this.isZero()) {
            return this.clone();
        }

        let v = this.cohort() as Rational;
        let q = this.quantum() as number;

        let roundedV = v.round(numDecimalDigits, mode);
        return new Decimal128(new Decimal({ cohort: roundedV, quantum: q }));
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

        let v = this.cohort();

        if (v === "0") {
            return new Decimal128("-0");
        }

        if (v === "-0") {
            return new Decimal128("0");
        }

        return new Decimal128(
            new Decimal({
                cohort: (v as Rational).negate(),
                quantum: this.quantum(),
            })
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
