export declare class Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
    readonly isNegative: boolean;
    constructor(p: bigint, q: bigint);
    toString(): string;
    private static _add;
    private static _subtract;
    private static _multiply;
    private static _divide;
    static add(x: Rational, ...theArgs: Rational[]): Rational;
    static subtract(x: Rational, ...theArgs: Rational[]): Rational;
    static multiply(x: Rational, ...theArgs: Rational[]): Rational;
    static divide(x: Rational, ...theArgs: Rational[]): Rational;
    negate(): Rational;
    toDecimalPlaces(n: number): string;
}
