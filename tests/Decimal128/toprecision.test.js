import { Decimal128 } from "../../src/Decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("toPrecision", () => {
    let d = new Decimal128("123.456");
    test("simple example, no arguments", () => {
        expect(d.toPrecision()).toStrictEqual("123.456");
    });
    test("simple example, negative, no arguments", () => {
        expect(d.negate().toPrecision()).toStrictEqual("-123.456");
    });
    test("simple example, argument is greater than total number of significant digits", () => {
        expect(d.toPrecision({ digits: 7 })).toStrictEqual("123.4560");
    });
    test("simple example, negative, argument is greater than total number of significant digits", () => {
        expect(d.negate().toPrecision({ digits: 7 })).toStrictEqual(
            "-123.4560"
        );
    });
    test("simple example, argument is equal to number of significant digits", () => {
        expect(d.toPrecision({ digits: 6 })).toStrictEqual("123.456");
    });
    test("simple example, negative, argument is equal to number of significant digits", () => {
        expect(d.negate().toPrecision({ digits: 6 })).toStrictEqual("-123.456");
    });
    test("simple example, argument less than number of significant digits, rounded needed", () => {
        expect(d.toPrecision({ digits: 5 })).toStrictEqual("123.46");
    });
    test("simple example, negative, argument less than number of significant digits, rounded needed", () => {
        expect(d.negate().toPrecision({ digits: 5 })).toStrictEqual("-123.46");
    });
    test("simple example, argument less than number of significant digits, rounded does not change last digit", () => {
        expect(d.toPrecision({ digits: 4 })).toStrictEqual("123.4");
    });
    test("simple example, negative, argument less than number of significant digits, rounded does not change last digit", () => {
        expect(d.negate().toPrecision({ digits: 4 })).toStrictEqual("-123.4");
    });
    test("simple example, argument equals number of integer digits", () => {
        expect(d.toPrecision({ digits: 3 })).toStrictEqual("123");
    });
    test("simple example, negative, argument equals number of integer digits", () => {
        expect(d.negate().toPrecision({ digits: 3 })).toStrictEqual("-123");
    });
    test("simple example, argument less than number of integer digits", () => {
        expect(d.toPrecision({ digits: 2 })).toStrictEqual("12e+2");
    });
    test("simple example, negative, argument less than number of integer digits", () => {
        expect(d.negate().toPrecision({ digits: 2 })).toStrictEqual("-12e+2");
    });
    test("simple example, single digit requested", () => {
        expect(d.toPrecision({ digits: 1 })).toStrictEqual("1e+3");
    });
    test("simple example, negative, single digit requested", () => {
        expect(d.negate().toPrecision({ digits: 1 })).toStrictEqual("-1e+3");
    });
    test("simple example, zero digits requested", () => {
        expect(() => d.toPrecision({ digits: 0 })).toThrow(RangeError);
    });
    test("non-object argument throws", () => {
        expect(() => d.toPrecision("whatever")).toThrow(TypeError);
    });
    test("object argument given, but has weird property", () => {
        expect(d.toPrecision({ foo: "bar" }).toString()).toStrictEqual(
            "123.456"
        );
    });
    test("non-integer number of digits requested", () => {
        expect(() => d.toPrecision({ digits: 1.72 }).toString()).toThrow(
            RangeError
        );
    });
    test("negative integer number of digits requested", () => {
        expect(() => d.toPrecision({ digits: -42 }).toString()).toThrow(
            RangeError
        );
    });
});

describe("NaN", () => {
    let nan = new Decimal128("NaN");
    test("works", () => {
        expect(nan.toPrecision()).toStrictEqual("NaN");
    });
    test("works, digist requested", () => {
        expect(nan.toPrecision({ digits: 42 })).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toPrecision()).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toPrecision()).toStrictEqual("-0");
    });
    test("zero point zero gets canonicalized", () => {
        expect(new Decimal128("0.0").toPrecision()).toStrictEqual("0");
    });
    test("zero point zero, one significant digit", () => {
        expect(new Decimal128("0.0").toPrecision({ digits: 1 })).toStrictEqual(
            "0"
        );
    });
});

describe("infinity", () => {
    let posInf = new Decimal128("Infinity");
    let negInf = new Decimal128("-Infinity");
    test("positive infinity", () => {
        expect(posInf.toPrecision()).toStrictEqual("Infinity");
    });
    test("positive infinity, digits requested", () => {
        expect(posInf.toPrecision({ digits: 42 })).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(negInf.toPrecision()).toStrictEqual("-Infinity");
    });
    test("negative infinity, digits requested", () => {
        expect(negInf.toPrecision({ digits: 42 })).toStrictEqual("-Infinity");
    });
});
