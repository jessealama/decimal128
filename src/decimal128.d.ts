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
export declare class Decimal128 {
    readonly significand: string;
    readonly exponent: number;
    readonly isNegative: boolean;
    private readonly digitStrRegExp;
    private readonly exponentRegExp;
    private readonly rat;
    constructor(s: string);
    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string;
    toExponentialString(): string;
    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    isInteger(): boolean;
    /**
     * Is this Decimal128 zero?
     */
    isZero(): boolean;
    /**
     * Are these two Decimal1288 values equal?
     *
     * @param x
     */
    equals(x: Decimal128): boolean;
    negate(): Decimal128;
    /**
     * Return the absolute value of this Decimal128 value.
     */
    abs(): Decimal128;
    /**
     * Return a digit string where the digits of this number are cut off after
     * a certain number of digits. Rounding may be performed, in case we always round up.
     *
     * @param n
     */
    toDecimalPlaces(n: number): Decimal128;
    /**
     * Return the ceiling of this number. That is: the smallest integer greater than or equal to this number.
     */
    ceil(): Decimal128;
    /**
     * Return the floor of this number. That is: the largest integer less than or equal to this number.
     */
    floor(): Decimal128;
    /**
     * Compare two values. Return
     *
     * + -1 if this value is strictly less than the other,
     * + 0 if they are equal, and
     * + 1 otherwise.
     *
     * @param x
     */
    cmp(x: Decimal128): number;
    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    truncate(): Decimal128;
    /**
     * Add two Decimal128 values.
     *
     * @param x
     * @param y
     * @private
     */
    private static _add;
    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     * @param theArgs An array of Decimal128 values to add to this one.
     */
    static add(x: Decimal128, ...theArgs: Decimal128[]): Decimal128;
    /**
     * Subtract another Decimal128 value from this one.
     *
     * @param x
     * @param y
     * @private
     */
    private static _subtract;
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
    static subtract(x: Decimal128, ...theArgs: Decimal128[]): Decimal128;
    private static _multiply;
    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     * @param theArgs
     */
    static multiply(x: Decimal128, ...theArgs: Decimal128[]): Decimal128;
    /**
     * Divide this Decimal128 value by another.
     *
     * Throws a RangeError if the divisor is zero.
     *
     * @param x
     * @param y
     */
    private static _divide;
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
    static divide(x: Decimal128, ...theArgs: Decimal128[]): Decimal128;
}
