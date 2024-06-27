import { Decimal128 } from "../../src/Decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toExponential()).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toExponential()).toStrictEqual("0e+0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toExponential()).toStrictEqual("-0e+0");
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toExponential()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toExponential()).toStrictEqual(
            "-Infinity"
        );
    });
});

describe("toExponential", function () {
    const d = "123.456";
    const decimalD = new Decimal128(d);
    test("no argument", () => {
        expect(decimalD.toExponential()).toStrictEqual("1.23456e+2");
    });
    test("wrong argument type", () => {
        expect(() => decimalD.toExponential("foo")).toThrow(TypeError);
    });
    test("empty options", () => {
        expect(decimalD.toExponential({})).toStrictEqual("1.23456e+2");
    });
    test("expected property missing", () => {
        expect(decimalD.toExponential({ foo: "bar" })).toStrictEqual(
            "1.23456e+2"
        );
    });
    test("more digits requested than integer digits available", () => {
        expectDecimal128(decimalD.toExponential({ digits: 7 }), "1.2345600e+2");
    });
    test("exact number of digits requested as digits available", () => {
        expectDecimal128(decimalD.toExponential({ digits: 6 }), "1.234560e+2");
    });
    test("possibly round non-integer part (1)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 5 }), "1.23456e+2");
    });
    test("possibly round non-integer part (2)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 4 }), "1.2345e+2");
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toExponential({ digits: 3 }), "1.234e+2");
    });
    test("cutoff if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 2 }), "1.23e+2");
    });
    test("cutoff if number has more digits than requested (2)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 1 }), "1.2e+2");
    });
    test("zero decimal places throws", () => {
        expect(() => decimalD.toExponential({ digits: 0 })).toThrow(RangeError);
    });
    test("negative number of decimal places", () => {
        expect(() => decimalD.toExponential({ digits: -1 })).toThrow(
            RangeError
        );
    });
    test("non-integer number throws", () => {
        expect(() => decimalD.toExponential({ digits: 1.5 })).toThrow(
            RangeError
        );
    });
    describe("negative", () => {
        let negD = decimalD.negate();
        test("integer part", () => {
            expect(negD.toExponential({ digits: 3 }).toString()).toStrictEqual(
                "-1.234e+2"
            );
        });
    });
});

describe("to exponential string", () => {
    test("one", () => {
        expect(new Decimal128("1").toExponential()).toStrictEqual("1e+0");
    });
    test("zero", () => {
        expect(new Decimal128("0").toExponential()).toStrictEqual("0e+0");
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").toExponential()).toStrictEqual("-0e+0");
    });
    test("integer", () => {
        expect(new Decimal128("42").toExponential()).toStrictEqual("4.2e+1");
    });

    test("round trip", () => {
        expect(new Decimal128("4.2E+0").toExponential()).toStrictEqual(
            "4.2e+0"
        );
    });

    test("significant has one digit", () => {
        expect(new Decimal128("1").toExponential()).toStrictEqual("1e+0");
    });
    test("negative exponent", () => {
        expect(new Decimal128("0.1").toExponential()).toStrictEqual("1e-1");
    });
    test("negative exponent, multiple digits", () => {
        expect(new Decimal128("0.01042").toExponential()).toStrictEqual(
            "1.042e-2"
        );
    });
});

describe("scientific string syntax", () => {
    test("1.23E+3", () => {
        expect(new Decimal128("1.23E+3").toString()).toStrictEqual("1230");
    });
    test("1.23E+5", () => {
        expect(new Decimal128("1.23E+5").toString()).toStrictEqual("123000");
    });
    test("1.23E-8", () => {
        expect(new Decimal128("1.23E-8").toString()).toStrictEqual(
            "0.0000000123"
        );
    });
    test("-1.23E-10", () => {
        expect(new Decimal128("-1.23E-10").toString()).toStrictEqual(
            "-0.000000000123"
        );
    });
    test("0E+2", () => {
        expect(new Decimal128("0E+2").toExponential()).toStrictEqual("0e+2");
    });
});
