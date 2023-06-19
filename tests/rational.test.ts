import { Rational } from "../src/rational";

describe("constructor", () => {
    test("cannot divide by zero", () => {
        expect(() => new Rational(1n, 0n)).toThrow(RangeError);
    });
    test("normalization happens at construction", () => {
        let r = new Rational(2n, 4n);
        expect(r.numerator).toStrictEqual(1n);
        expect(r.denominator).toStrictEqual(2n);
    });
    test("negative numerator", () => {
        expect(new Rational(-1n, 2n).isNegative).toStrictEqual(true);
    });
    test("negative denominator", () => {
        expect(new Rational(1n, -2n).isNegative).toStrictEqual(true);
    });
    test("negative numerator and denominator", () => {
        expect(new Rational(-1n, -2n).isNegative).toStrictEqual(false);
    });
});
