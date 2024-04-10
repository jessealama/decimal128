import JSBI from "jsbi";
import { Rational } from "../../src/Rational.mjs";

describe("constructor", () => {
    test("cannot divide by zero", () => {
        expect(() => new Rational(JSBI.BigInt(1), JSBI.BigInt(0))).toThrow(RangeError);
    });
    test("normalization happens at construction", () => {
        let r = new Rational(JSBI.BigInt(2), JSBI.BigInt(4));
        expect(r.numerator).toStrictEqual(JSBI.BigInt(1));
        expect(r.denominator).toStrictEqual(JSBI.BigInt(2));
    });
    test("negative numerator", () => {
        expect(new Rational(JSBI.BigInt(-1), JSBI.BigInt(2)).isNegative).toStrictEqual(true);
    });
    test("negative denominator", () => {
        expect(new Rational(JSBI.BigInt(1), JSBI.BigInt(-2)).isNegative).toStrictEqual(true);
    });
    test("negative numerator and denominator", () => {
        expect(new Rational(JSBI.BigInt(-1), JSBI.BigInt(-2)).isNegative).toStrictEqual(false);
    });
});

describe("toString", () => {
    test("simple", () => {
        expect(new Rational(JSBI.BigInt(1), JSBI.BigInt(2)).toString()).toStrictEqual("1/2");
    });
    test("negative", () => {
        expect(new Rational(JSBI.BigInt(-3), JSBI.BigInt(7)).toString()).toStrictEqual("-3/7");
    });
});

describe("toFixed", () => {
    test("zero", () => {
        let d = new Rational(JSBI.BigInt(0), JSBI.BigInt(1));
        expect(d.toFixed(1)).toStrictEqual("0.0");
        expect(d.toFixed(5)).toStrictEqual("0.00000");
    });
    test("exactly representable", () => {
        expect(new Rational(JSBI.BigInt(3), JSBI.BigInt(2)).toFixed(1)).toStrictEqual("1.5");
        expect(new Rational(JSBI.BigInt(1), JSBI.BigInt(2)).toFixed(1)).toStrictEqual("0.5");
        expect(new Rational(JSBI.BigInt(1), JSBI.BigInt(5)).toFixed(1)).toStrictEqual("0.2");
        expect(new Rational(JSBI.BigInt(367), JSBI.BigInt(1000)).toFixed(3)).toStrictEqual("0.367");
    });
    test("more digits requested than necessary", () => {
        expect(new Rational(JSBI.BigInt(3), JSBI.BigInt(2)).toFixed(3)).toStrictEqual("1.500");
    });
    test("not exactly representable", () => {
        let third = new Rational(JSBI.BigInt(1), JSBI.BigInt(3));
        expect(third.toFixed(1)).toStrictEqual("0.3");
        expect(third.toFixed(2)).toStrictEqual("0.33");
        expect(third.toFixed(5)).toStrictEqual("0.33333");
    });
    test("representable, greater than one", () => {
        expect(new Rational(JSBI.BigInt(5), JSBI.BigInt(2)).toFixed(2)).toStrictEqual("2.50");
    });
    test("not exactly representable, greater than one", () => {
        expect(new Rational(JSBI.BigInt(5), JSBI.BigInt(3)).toFixed(2)).toStrictEqual("1.66");
    });
    test("non-integer value not OK", () => {
        expect(() => new Rational(JSBI.BigInt(1), JSBI.BigInt(2)).toFixed(1.6)).toThrow(TypeError);
    });
    test("negative integer not OK", () => {
        expect(() => new Rational(JSBI.BigInt(1), JSBI.BigInt(2)).toFixed(-1)).toThrow(RangeError);
    });
});
