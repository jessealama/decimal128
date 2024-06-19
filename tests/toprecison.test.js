import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toPrecision()).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toPrecision()).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toPrecision()).toStrictEqual("-0");
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toPrecision()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toPrecision()).toStrictEqual(
            "-Infinity"
        );
    });
});

describe("toprecision", function () {
    const d = "123.456";
    const decimalD = new Decimal128(d);
    test("no argument", () => {
        expect(decimalD.toPrecision()).toStrictEqual("123.456");
    });
    test("wrong argument type", () => {
        expect(() => decimalD.toPrecision("foo")).toThrow(TypeError);
    });
    test("empty options", () => {
        expect(decimalD.toPrecision({})).toStrictEqual("123.456");
    });
    test("expected property missing", () => {
        expect(decimalD.toPrecision({ foo: "bar" })).toStrictEqual("123.456");
    });
    test("more digits requested than integer digits available", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 7 }), "123.4560");
    });
    test("exact number of digits requested as digits available", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 6 }), "123.456");
    });
    test("possibly round non-integer part (1)", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 5 }), "123.45");
    });
    test("possibly round non-integer part (2)", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 4 }), "123.4");
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 3 }), "123");
    });
    test("cutoff if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 2 }), "1.2e+2");
    });
    test("cutoff if number has more digits than requested (2)", () => {
        expectDecimal128(decimalD.toPrecision({ digits: 1 }), "1e+2");
    });
    test("zero decimal places throws", () => {
        expect(() => decimalD.toPrecision({ digits: 0 })).toThrow(RangeError);
    });
    test("negative number of decimal places", () => {
        expect(() => decimalD.toPrecision({ digits: -1 })).toThrow(RangeError);
    });
    test("non-integer number throws", () => {
        expect(() => decimalD.toPrecision({ digits: 1.5 })).toThrow(RangeError);
    });
    describe("negative", () => {
        let negD = decimalD.neg();
        test("integer part", () => {
            expect(negD.toPrecision({ digits: 3 }).toString()).toStrictEqual(
                "-123"
            );
        });
    });
});
