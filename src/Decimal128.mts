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

import {
    RoundingMode,
    ROUNDING_MODES,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_TRUNCATE,
} from "./common.mjs";
import { Rational } from "./Rational.mjs";
import { Decimal } from "./Decimal.mjs";

const EXPONENT_MIN = -6176;
const NORMAL_EXPONENT_MIN = -6143;
const EXPONENT_MAX = 6111;
const NORMAL_EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

const bigTen = BigInt(10);

type NaNValue = "NaN";
type InfiniteValue = "Infinity" | "-Infinity";
type FiniteValue = Decimal;

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";
const TEN_MAX_EXPONENT = bigTen ** BigInt(MAX_SIGNIFICANT_DIGITS);

function pickQuantum(
    d: "0" | "-0" | Rational,
    preferredQuantum: number
): number {
    if (preferredQuantum < EXPONENT_MIN) {
        return EXPONENT_MIN;
    }

    if (preferredQuantum > EXPONENT_MAX) {
        return EXPONENT_MAX;
    }

    return preferredQuantum;
}

function adjustDecimal128(d: Decimal): Decimal128Value {
    let v = d.cohort;
    let q = d.quantum;

    if (v === "0" || v === "-0") {
        return new Decimal({ cohort: v, quantum: pickQuantum(v, q) });
    }

    if (d.isNegative()) {
        let adjusted = adjustDecimal128(d.negate());

        if (adjusted === "Infinity") {
            return "-Infinity";
        }

        return (adjusted as Decimal).negate();
    }

    let coef = d.coefficient();

    if (coef <= TEN_MAX_EXPONENT && EXPONENT_MIN <= q && q <= EXPONENT_MAX) {
        return d;
    }

    let renderedCohort = v.toFixed(Infinity);
    let [integerPart, _] = renderedCohort.split(/[.]/);

    if (integerPart === "0") {
        integerPart = "";
    }

    if (integerPart.length > MAX_SIGNIFICANT_DIGITS) {
        return "Infinity";
    }

    let scaledSig = v.scale10(MAX_SIGNIFICANT_DIGITS - integerPart.length);
    let rounded = scaledSig.round(0, "halfEven");
    let rescaled = rounded.scale10(
        0 - MAX_SIGNIFICANT_DIGITS + integerPart.length
    );

    if (rescaled.isZero()) {
        return new Decimal({ cohort: "0", quantum: pickQuantum("0", q) });
    }

    let rescaledAsString = rescaled.toFixed(Infinity);
    return new Decimal(rescaledAsString);
}

function validateConstructorData(x: Decimal128Value): Decimal128Value {
    if (x === "NaN" || x === "Infinity" || x === "-Infinity") {
        return x; // no further validation needed
    }

    let val = x as FiniteValue;

    let v = val.cohort;
    let q = val.quantum;

    let d = new Decimal({ cohort: v, quantum: q });

    return adjustDecimal128(d);
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
        let d = this.d as Decimal;
        return d.cohort;
    }

    private quantum(): number {
        let d = this.d as Decimal;
        return d.quantum;
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
            return this.negate().mantissa().negate();
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

        let v = this.cohort();

        if (v === "0" || v === "-0") {
            return this.clone();
        }

        let q = this.quantum() as number;

        return new Decimal128(
            new Decimal({ cohort: v.scale10(n), quantum: q + n })
        );
    }

    private coefficient(): bigint {
        let d = this.d as Decimal;
        return d.coefficient();
    }

    private emitExponential(): string {
        let v = this.cohort();
        let q = this.quantum();
        let p = this._isNegative ? "-" : "";

        if (v === "0" || v === "-0") {
            return v + "e" + (q < 0 ? "-" : "+") + Math.abs(q);
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
            if (asDecimalString.match(/[.]$/)) {
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

        let rounded = this.round(n);
        let roundedRendered = rounded.emitDecimal();

        if (roundedRendered.match(/[.]/)) {
            let [lhs, rhs] = roundedRendered.split(/[.]/);
            return lhs + "." + rhs.substring(0, n);
        }

        return roundedRendered;
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
            if (lhs.length === n) {
                return p + lhs;
            }

            return p + s.substring(0, n) + "e+" + `${lhs.length - n + 1}`;
        }

        if (n <= lhs.length + rhs.length) {
            let rounded = this.round(n - lhs.length);
            return rounded.emitDecimal();
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
                return this.negate();
            }

            return this.clone();
        }

        if (this.isNegative()) {
            return this.negate();
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
            return this.negate().add(x.negate()).negate();
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
            return x.negate();
        }

        if (x.isNegative()) {
            return this.add(x.negate());
        }

        if (this.isZero()) {
            return x.negate();
        }

        if (x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;
        let ourExponent = this.quantum() as number;
        let theirExponent = x.quantum() as number;
        let difference: "0" | "-0" | Rational = Rational.subtract(
            ourCohort,
            theirCohort
        );
        let preferredQuantum = Math.min(ourExponent, theirExponent);

        if (difference.isZero()) {
            difference = "0";
        }

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
            return this.negate().multiply(x).negate();
        }

        if (x.isNegative()) {
            return this.multiply(x.negate()).negate();
        }

        let ourCohort = this.cohort() as Rational;
        let theirCohort = x.cohort() as Rational;
        let ourQuantum = this.quantum() as number;
        let theirQuantum = x.quantum() as number;
        let preferredQuantum = ourQuantum + theirQuantum;

        if (this.isZero()) {
            return new Decimal128(
                new Decimal({
                    cohort: this.cohort(),
                    quantum: preferredQuantum,
                })
            );
        }

        if (x.isZero()) {
            return new Decimal128(
                new Decimal({
                    cohort: x.cohort(),
                    quantum: preferredQuantum,
                })
            );
        }

        let product = Rational.multiply(ourCohort, theirCohort);
        let actualQuantum = pickQuantum(product, preferredQuantum);

        return new Decimal128(
            new Decimal({
                cohort: product,
                quantum: actualQuantum,
            })
        );
    }

    private clone(): Decimal128 {
        if (this.isNaN()) {
            return new Decimal128(NAN);
        }

        if (!this.isFinite()) {
            return new Decimal128(
                this.isNegative() ? NEGATIVE_INFINITY : POSITIVE_INFINITY
            );
        }

        return new Decimal128(
            new Decimal({ cohort: this.cohort(), quantum: this.quantum() })
        );
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

        if (x.isZero()) {
            return new Decimal128(NAN);
        }

        if (this.isZero()) {
            return this.clone();
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
            return this.negate().divide(x).negate();
        }

        if (x.isNegative()) {
            return this.divide(x.negate()).negate();
        }

        let adjust = 0;
        let dividendCoefficient = this.coefficient();
        let divisorCoefficient = x.coefficient();

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

        let ourExponent = this.quantum();
        let theirExponent = x.quantum();
        let resultExponent = ourExponent - (theirExponent + adjust);
        return new Decimal128(`${resultCoefficient}E${resultExponent}`);
    }

    /**
     *
     * @param numDecimalDigits
     * @param {RoundingMode} mode (default: ROUNDING_MODE_DEFAULT)
     */
    round(
        numDecimalDigits: number = 0,
        mode: RoundingMode = ROUNDING_MODE_HALF_EVEN
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
        let roundedV = v.round(numDecimalDigits, mode);

        if (roundedV.isZero()) {
            return new Decimal128(
                new Decimal({
                    cohort: v.isNegative ? "-0" : "0",
                    quantum: 0 - numDecimalDigits,
                })
            );
        }

        return new Decimal128(
            new Decimal({ cohort: roundedV, quantum: 0 - numDecimalDigits })
        );
    }

    negate(): Decimal128 {
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
            return new Decimal128(
                new Decimal({ cohort: "-0", quantum: this.quantum() })
            );
        }

        if (v === "-0") {
            return new Decimal128(
                new Decimal({ cohort: "0", quantum: this.quantum() })
            );
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
            return this.negate().remainder(d).negate();
        }

        if (d.isNegative()) {
            return this.remainder(d.negate());
        }

        if (!this.isFinite()) {
            return new Decimal128(NAN);
        }

        if (!d.isFinite()) {
            return this.clone();
        }

        if (d.isZero()) {
            return new Decimal128(NAN);
        }

        if (this.cmp(d) === -1) {
            return this.clone();
        }

        let q = this.divide(d).round(0, ROUNDING_MODE_TRUNCATE);
        return this.subtract(d.multiply(q));
    }

    isNormal(): boolean {
        if (this.isNaN()) {
            throw new RangeError("Cannot determine whether NaN is normal");
        }

        if (!this.isFinite()) {
            throw new RangeError(
                "Only finite numbers can be said to be normal or not"
            );
        }

        if (this.isZero()) {
            throw new RangeError(
                "Only non-zero numbers can be said to be normal or not"
            );
        }

        let exp = this.exponent();
        return exp >= NORMAL_EXPONENT_MIN && exp <= NORMAL_EXPONENT_MAX;
    }

    isSubnormal(): boolean {
        if (this.isNaN()) {
            throw new RangeError("Cannot determine whether NaN is subnormal");
        }

        if (!this.isFinite()) {
            throw new RangeError(
                "Only finite numbers can be said to be subnormal or not"
            );
        }

        let exp = this.exponent();
        return exp < NORMAL_EXPONENT_MIN;
    }

    truncatedExponent(): number {
        if (this.isZero() || this.isSubnormal()) {
            return NORMAL_EXPONENT_MIN;
        }

        return this.exponent();
    }

    scaledSignificand(): bigint {
        if (this.isNaN()) {
            throw new RangeError("NaN does not have a scaled significand");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity does not have a scaled significand");
        }

        if (this.isZero()) {
            return 0n;
        }

        let v = this.cohort() as Rational;
        let te = this.truncatedExponent();
        let ss = v.scale10(MAX_SIGNIFICANT_DIGITS - 1 - te);

        return ss.numerator;
    }
}

Decimal128.prototype.valueOf = function () {
    throw TypeError("Decimal128.prototype.valueOf throws unconditionally");
};
