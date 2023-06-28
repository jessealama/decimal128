import { Rational, RationalCalculator } from "../src/rational";

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

describe("toDecimalPlaces", () => {
    test("zero", () => {
        let d = new Rational(0n, 1n);
        expect(d.toDecimalPlaces(1)).toStrictEqual("0");
        expect(d.toDecimalPlaces(5)).toStrictEqual("0");
    });
    test("exactly representable", () => {
        expect(new Rational(1n, 2n).toDecimalPlaces(1)).toStrictEqual("0.5");
        expect(new Rational(1n, 5n).toDecimalPlaces(1)).toStrictEqual("0.2");
    });
    test("not exactly representable", () => {
        let third = new Rational(1n, 3n);
        expect(third.toDecimalPlaces(1)).toStrictEqual("0.3");
        expect(third.toDecimalPlaces(2)).toStrictEqual("0.33");
        expect(third.toDecimalPlaces(5)).toStrictEqual("0.33333");
    });
    test("representable, greater than one", () => {
        expect(new Rational(5n, 2n).toDecimalPlaces(2)).toStrictEqual("2.5");
    });
    test("not exactly representable, greater than one", () => {
        expect(new Rational(5n, 3n).toDecimalPlaces(2)).toStrictEqual("1.6");
    });
    test("non-integer value not OK", () => {
        expect(() => new Rational(1n, 2n).toDecimalPlaces(1.6)).toThrow(
            TypeError
        );
    });
    test("negative integer not OK", () => {
        expect(() => new Rational(1n, 2n).toDecimalPlaces(-1)).toThrow(
            RangeError
        );
    });
});

describe("calculator", () => {
    test("empty stack throws", () => {
        expect(() => new RationalCalculator().evaluate()).toThrow(Error);
    });
    test("stack with a single operator throws", () => {
        expect(() => new RationalCalculator().add().evaluate()).toThrow(Error);
        expect(() => new RationalCalculator().subtract().evaluate()).toThrow(
            Error
        );
        expect(() => new RationalCalculator().multiply().evaluate()).toThrow(
            Error
        );
        expect(() => new RationalCalculator().divide().evaluate()).toThrow(
            Error
        );
    });
    test("stack with a single number returns number", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        expect(calc.evaluate()).toEqual(new Rational(1n, 2n));
    });
    test("stack with two numbers throws", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.push(new Rational(1n, 2n));
        expect(() => calc.evaluate()).toThrow(Error);
    });
    test("push multiple numbers at once", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n), new Rational(1n, 3n));
        calc.subtract();
        expect(calc.evaluate()).toEqual(new Rational(1n, 6n));
    });
    test("operator still on the stack", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.add();
        calc.add();
        expect(() => calc.evaluate()).toThrow(Error);
    });
    test("addition", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.push(new Rational(1n, 3n));
        calc.add();
        expect(calc.evaluate()).toEqual(new Rational(5n, 6n));
    });
    test("subtraction", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.push(new Rational(1n, 3n));
        calc.subtract();
        expect(calc.evaluate()).toEqual(new Rational(1n, 6n));
    });
    test("multiplication", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.push(new Rational(1n, 5n));
        calc.multiply();
        expect(calc.evaluate()).toEqual(new Rational(1n, 10n));
    });
    test("division", () => {
        let calc = new RationalCalculator();
        calc.push(new Rational(1n, 2n));
        calc.push(new Rational(1n, 3n));
        calc.divide();
        expect(calc.evaluate()).toEqual(new Rational(3n, 2n));
    });
});
