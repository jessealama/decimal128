import { Decimal128 } from "../src/decimal128.mjs";

let tests = {
    "simple example": ["4.1", "1.25", "3.28"],
    "finite decimal representation": ["0.654", "0.12", "5.45"],
    "infinite decimal representation": [
        "0.11",
        "0.3",
        "0.3666666666666666666666666666666667",
    ],
    "many digits, few significant": [
        "0.00000000000000000000000000000000000001",
        "2",
        "0.000000000000000000000000000000000000005",
    ],
    "one third": ["1", "3", "0.3333333333333333333333333333333333"],
    "one tenth": ["1", "10", "0.1"],
};

describe("division", () => {
    for (let [name, [a, b, c]] of Object.entries(tests)) {
        test(name, () => {
            expect(
                new Decimal128(a).divide(new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    }
    test("zero divided by zero", () => {
        expect(
            new Decimal128("0").divide(new Decimal128("0")).toString()
        ).toStrictEqual("NaN");
    });
    describe("NaN", () => {
        test("NaN divided by NaN is NaN", () => {
            expect(
                new Decimal128("NaN").divide(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN divided by number is NaN", () => {
            expect(
                new Decimal128("NaN").divide(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number divided by NaN is NaN", () => {
            expect(
                new Decimal128("1").divide(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("divide by zero is NaN", () => {
            expect(
                new Decimal128("42").divide(new Decimal128("0")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("infinity divided by infinity is NaN", () => {
            expect(posInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("infinity divided by negative infinity is NaN", () => {
            expect(posInf.divide(negInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity divided by infinity is NaN", () => {
            expect(negInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity divided by positive infinity is NaN", () => {
            expect(negInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("positive infinity divided by positive number", () => {
            expect(
                posInf.divide(new Decimal128("123.5")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive infinity divided by negative number", () => {
            expect(
                posInf.divide(new Decimal128("-2")).toString()
            ).toStrictEqual("-Infinity");
        });
        test("minus infinity divided by positive number", () => {
            expect(
                negInf.divide(new Decimal128("17")).toString()
            ).toStrictEqual("-Infinity");
        });
        test("minus infinity divided by negative number", () => {
            expect(
                negInf.divide(new Decimal128("-99.3")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive number divided bv positive infinity", () => {
            expect(
                new Decimal128("123.5").divide(posInf).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive number divided bv negative infinity", () => {
            expect(
                new Decimal128("123.5").divide(negInf).toString()
            ).toStrictEqual("-Infinity");
        });
        test("negative number divided by positive infinity", () => {
            expect(
                new Decimal128("-2").divide(posInf).toString()
            ).toStrictEqual("-Infinity");
        });
        test("negative number divided by negative infinity", () => {
            expect(
                new Decimal128("-2").divide(negInf).toString()
            ).toStrictEqual("Infinity");
        });
    });
});
