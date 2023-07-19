import { RationalDecimal128 } from "./rationalDecimal128.mjs";

/**
 * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
 */
function isInteger(d: string): boolean {
    return new RationalDecimal128(d).isInteger();
}

/**
 * Return the absolute value of this Decimal128 value.
 *
 * @param d
 */
function abs(d: string): string {
    return new RationalDecimal128(d).abs().toString();
}

/**
 * Return a digit string where the digits of this number are cut off after
 * a certain number of digits. Rounding may be performed, in case we always round up.
 *
 * @param d
 * @param n
 */
function toDecimalPlaces(d: string, n: number): string {
    return new RationalDecimal128(d).toDecimalPlaces(n).toString();
}

function toExponentialString(d: string): string {
    return new RationalDecimal128(d).toExponentialString();
}

/**
 * Return the ceiling of this number. That is: the smallest integer greater than or equal to this number.
 */
function ceil(d: string): string {
    return new RationalDecimal128(d).ceil().toString();
}

/**
 * Return the floor of this number. That is: the largest integer less than or equal to this number.
 *
 * @param d A Decimal128 value.
 */
function floor(d: string): string {
    return new RationalDecimal128(d).floor().toString();
}

/**
 * Compare two values. Return
 *
 * + -1 if this value is strictly less than the other,
 * + 0 if they are equal, and
 * + 1 otherwise.
 *
 * @param x
 * @param y
 */
function cmp(x: string, y: string): -1 | 0 | 1 {
    return new RationalDecimal128(x).cmp(new RationalDecimal128(y));
}

/**
 * Truncate the decimal part of this number (if any), returning an integer.
 *
 * @param d A Decimal128 value.
 * @return {RationalDecimal128} An integer (as a Decimal128 value).
 */
function truncate(d: string): string {
    return new RationalDecimal128(d).truncate().toString();
}

/**
 * Add this Decimal128 value to one or more Decimal128 values.
 *
 * @param x
 * @param y
 */
function add(x: string, y: string): string {
    return new RationalDecimal128(x).add(new RationalDecimal128(y)).toString();
}

/**
 * Subtract another Decimal128 value from one or more Decimal128 values.
 *
 * @param x
 * @param y
 */
function subtract(x: string, y: string): string {
    return new RationalDecimal128(x)
        .subtract(new RationalDecimal128(y))
        .toString();
}

/**
 * Multiply this Decimal128 value by an array of other Decimal128 values.
 *
 * If no arguments are given, return this value.
 *
 * @param x
 * @param y
 */
function multiply(x: string, y: string): string {
    return new RationalDecimal128(x)
        .multiply(new RationalDecimal128(y))
        .toString();
}

/**
 * Divide this Decimal128 value by an array of other Decimal128 values.
 *
 * Association is to the left: 1/2/3 is (1/2)/3
 *
 * If only one argument is given, just return the first argument.
 *
 * @param x
 * @param y
 */
function divide(x: string, y: string): string {
    return new RationalDecimal128(x)
        .divide(new RationalDecimal128(y))
        .toString();
}

function round(x: string, n: number = 0): string {
    return new RationalDecimal128(x).round(n).toString();
}

/**
 * Return the remainder of this Decimal128 value divided by another Decimal128 value.
 *
 * @param n
 * @param d
 * @throws RangeError If argument is zero
 */
function remainder(n: string, d: string): string {
    return new RationalDecimal128(n)
        .remainder(new RationalDecimal128(d))
        .toString();
}

function multiplyAndAdd(x: string, y: string, z: string): string {
    return new RationalDecimal128(x)
        .multiplyAndAdd(new RationalDecimal128(y), new RationalDecimal128(z))
        .toString();
}

export const Decimal128 = {
    isInteger: isInteger,
    abs: abs,
    toDecimalPlaces: toDecimalPlaces,
    toExponentialString: toExponentialString,
    ceil: ceil,
    floor: floor,
    round: round,
    cmp: cmp,
    truncate: truncate,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    remainder: remainder,
    multiplyAndAdd: multiplyAndAdd,
};
