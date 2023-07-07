export declare class Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
    readonly isNegative: boolean;
    constructor(p: bigint, q: bigint);
    toString(): string;
    private negate;
    private reciprocal;
    private static _add;
    private static _subtract;
    private static _multiply;
    private static _divide;
    static add(...theArgs: Rational[]): Rational;
    static subtract(x: Rational, ...theArgs: Rational[]): Rational;
    static multiply(...theArgs: Rational[]): Rational;
    static divide(x: Rational, ...theArgs: Rational[]): Rational;
    toDecimalPlaces(n: number): string;
    cmp(x: Rational): number;
}
