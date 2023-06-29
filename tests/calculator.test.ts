import { Decimal128, DecimalCalculator } from "../src/decimal128";

describe("calculator", () => {
    test("empty stack throws", () => {
        expect(() => new DecimalCalculator().evaluate()).toThrow(Error);
    });
    test("stack with a single operator throws", () => {
        expect(() => new DecimalCalculator().add().evaluate()).toThrow(Error);
        expect(() => new DecimalCalculator().subtract().evaluate()).toThrow(
            Error
        );
        expect(() => new DecimalCalculator().multiply().evaluate()).toThrow(
            Error
        );
        expect(() => new DecimalCalculator().divide().evaluate()).toThrow(
            Error
        );
    });
    test("stack with a single number returns number", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        expect(calc.evaluate().toString()).toStrictEqual("0.5");
    });
    test("stack with two numbers throws", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.push(new Decimal128("0.5"));
        expect(() => calc.evaluate()).toThrow(Error);
    });
    test("push multiple numbers at once", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"), new Decimal128("0.3"));
        calc.subtract();
        expect(calc.evaluate().toString()).toStrictEqual("0.2");
    });
    test("operator still on the stack", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.add();
        calc.add();
        expect(() => calc.evaluate()).toThrow(Error);
    });
    test("addition", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.push(new Decimal128("0.6"));
        calc.add();
        expect(calc.evaluate().toString()).toStrictEqual("1.1");
    });
    test("subtraction", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.push(new Decimal128("0.6"));
        calc.subtract();
        expect(calc.evaluate().toString()).toStrictEqual("-0.1");
    });
    test("multiplication", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.push(new Decimal128("0.6"));
        calc.multiply();
        expect(calc.evaluate().toString()).toStrictEqual("0.3");
    });
    test("division", () => {
        let calc = new DecimalCalculator();
        calc.push(new Decimal128("0.5"));
        calc.push(new Decimal128("0.6"));
        calc.divide();
        expect(calc.evaluate().toString()).toStrictEqual(
            "0.8333333333333333333333333333333333"
        );
    });
});

describe("comparing calculator with naive chained operations", () => {
    test("one third times three", () => {
        let one = new Decimal128("1");
        let three = new Decimal128("3");
        expect(one.divide(three).multiply(three).toString()).toStrictEqual(
            "0.9999999999999999999999999999999999"
        );
        // replay the above in a calculator:
        let calc = new DecimalCalculator();
        calc.push(one);
        calc.push(three);
        calc.divide();
        calc.push(three);
        calc.multiply();
        expect(calc.evaluate().toString()).toStrictEqual("1");
    });
});
