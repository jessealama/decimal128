export declare class Decimal {
    /**
     * Is this Decimal128 actually an integer? That is: is there nothing after the decimal point?
     */
    static isInteger(d: string): boolean;
    /**
     * Return the absolute value of this Decimal128 value.
     *
     * @param d
     */
    static abs(d: string): string;
    /**
     * Return a digit string where the digits of this number are cut off after
     * a certain number of digits. Rounding may be performed, in case we always round up.
     *
     * @param d
     * @param n
     */
    static toDecimalPlaces(d: string, n: number): string;
    /**
     * Return the ceiling of this number. That is: the smallest integer greater than or equal to this number.
     */
    static ceil(d: string): string;
    /**
     * Return the floor of this number. That is: the largest integer less than or equal to this number.
     *
     * @param d A Decimal128 value.
     */
    static floor(d: string): string;
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
    static cmp(x: string, y: string): -1 | 0 | 1;
    /**
     * Truncate the decimal part of this number (if any), returning an integer.
     *
     * @param d A Decimal128 value.
     * @return {Decimal128} An integer (as a Decimal128 value).
     */
    static truncate(d: string): string;
    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param theArgs A list of Decimal128 values to add
     */
    static add(...theArgs: string[]): string;
    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     * @param y
     */
    static subtract(x: string, y: string): string;
    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param theArgs A list of Decimal128 values to multiply
     */
    static multiply(...theArgs: string[]): string;
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
    static divide(x: string, y: string): string;
    static round(x: string, n?: number): string;
    /**
     * Return the remainder of this Decimal128 value divided by another Decimal128 value.
     *
     * @param n
     * @param d
     * @throws RangeError If argument is zero
     */
    static remainder(n: string, d: string): string;
}
