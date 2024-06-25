import { Rational } from "../../src/Rational.mjs";
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

describe("toString", () => {
    test("simple", () => {
        expect(new Rational(1n, 2n).toString()).toStrictEqual("1/2");
    });
    test("negative", () => {
        expect(new Rational(-3n, 7n).toString()).toStrictEqual("-3/7");
    });
});

describe("toFixed", () => {
    test("zero", () => {
        let d = new Rational(0n, 1n);
        expect(d.toFixed(1)).toStrictEqual("0");
        expect(d.toFixed(5)).toStrictEqual("0");
    });
    test("exactly representable", () => {
        expect(new Rational(3n, 2n).toFixed(1)).toStrictEqual("1.5");
        expect(new Rational(1n, 2n).toFixed(1)).toStrictEqual("0.5");
        expect(new Rational(1n, 5n).toFixed(1)).toStrictEqual("0.2");
        expect(new Rational(367n, 1000n).toFixed(3)).toStrictEqual("0.367");
    });
    test("more digits requested than necessary", () => {
        expect(new Rational(3n, 2n).toFixed(3)).toStrictEqual("1.500");
    });
    test("not exactly representable", () => {
        let third = new Rational(1n, 3n);
        expect(third.toFixed(1)).toStrictEqual("0.3");
        expect(third.toFixed(2)).toStrictEqual("0.33");
        expect(third.toFixed(5)).toStrictEqual("0.33333");
    });
    test("representable, greater than one", () => {
        expect(new Rational(5n, 2n).toFixed(2)).toStrictEqual("2.50");
    });
    test("not exactly representable, greater than one", () => {
        expect(new Rational(5n, 3n).toFixed(2)).toStrictEqual("1.66");
    });
    test("non-integer value not OK", () => {
        expect(() => new Rational(1n, 2n).toFixed(1.6)).toThrow(TypeError);
    });
    test("negative integer not OK", () => {
        expect(() => new Rational(1n, 2n).toFixed(-1)).toThrow(RangeError);
    });
});
