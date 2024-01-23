import { Decimal128 } from "../src/decimal128.mjs";

describe("division", () => {
    test("simple example", () => {
        expect(
            new Decimal128("4.1").divide(new Decimal128("1.25")).toString()
        ).toStrictEqual("3.28");
    });
    test("finite decimal representation", () => {
        expect(
            new Decimal128("0.654").divide(new Decimal128("0.12")).toString()
        ).toStrictEqual("5.45");
    });
    test("infinite decimal representation", () => {
        expect(
            new Decimal128("0.11").divide(new Decimal128("0.3")).toString()
        ).toStrictEqual("0.3666666666666666666666666666666667");
    });
    test("many digits, few significant", () => {
        expect(
            new Decimal128("0.00000000000000000000000000000000000001")
                .divide(new Decimal128("2"))
                .toString()
        ).toStrictEqual("0.000000000000000000000000000000000000005");
    });
    test("one third", () => {
        expect(
            new Decimal128("1").divide(new Decimal128("3")).toString()
        ).toStrictEqual("0.3333333333333333333333333333333333");
    });
    test("one tenth", () => {
        expect(
            new Decimal128("1").divide(new Decimal128("10")).toString()
        ).toStrictEqual("0.1");
    });
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
            ).toStrictEqual("0");
        });
        test("positive number divided bv negative infinity", () => {
            expect(
                new Decimal128("123.5").divide(negInf).toString()
            ).toStrictEqual("-0");
        });
        test("negative number divided by positive infinity", () => {
            expect(
                new Decimal128("-2").divide(posInf).toString()
            ).toStrictEqual("-0");
        });
        test("negative number divided by negative infinity", () => {
            expect(
                new Decimal128("-2").divide(negInf).toString()
            ).toStrictEqual("0");
        });
    });
    test("negative zero", () => {
        expect(
            new Decimal128("-0").divide(new Decimal128("1")).toString()
        ).toStrictEqual("-0");
    });
    test("negative argument", () => {
        expect(
            new Decimal128("42.6").divide(new Decimal128("-2.0")).toString()
        ).toStrictEqual("-21.3");
    });
    test("dividend and divisor are both negative", () => {
        expect(
            new Decimal128("-42.6").divide(new Decimal128("-2.0")).toString()
        ).toStrictEqual("21.3");
    });
});

describe("examples from the General Decimal Arithmetic Specification", () => {
    // some examples have been tweaked because we are working with more precision in Decimal128
    test("example one", () => {
        expect(
            new Decimal128("1").divide(new Decimal128("3")).toString()
        ).toStrictEqual("0.3333333333333333333333333333333333");
    });
    test("example two", () => {
        expect(
            new Decimal128("2").divide(new Decimal128("3")).toString()
        ).toStrictEqual("0.6666666666666666666666666666666667");
    });
    test("example three", () => {
        expect(
            new Decimal128("5").divide(new Decimal128("2")).toString()
        ).toStrictEqual("2.5");
    });
    test("example four", () => {
        expect(
            new Decimal128("1").divide(new Decimal128("10")).toString()
        ).toStrictEqual("0.1");
    });
    test("example five", () => {
        expect(
            new Decimal128("12").divide(new Decimal128("12")).toString()
        ).toStrictEqual("1");
    });
    test("example six", () => {
        expect(
            new Decimal128("8.00").divide(new Decimal128("2")).toString()
        ).toStrictEqual("4.00");
    });
    test("example seven", () => {
        expect(
            new Decimal128("2.400").divide(new Decimal128("2.0")).toString()
        ).toStrictEqual("1.20");
    });
    test("example eight", () => {
        expect(
            new Decimal128("1000").divide(new Decimal128("100")).toString()
        ).toStrictEqual("10");
    });
    test("example nine", () => {
        expect(
            new Decimal128("1000").divide(new Decimal128("1")).toString()
        ).toStrictEqual("1000");
    });
    test("example ten", () => {
        expect(
            new Decimal128("2.40E+6")
                .divide(new Decimal128("2"))
                .toExponentialString()
        ).toStrictEqual("1.20E+6");
    });
});
