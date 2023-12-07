import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

const d = "123.456";

describe("to decimal places", function () {
    const decimalD = new Decimal128(d);
    test("more digits than available means no change", () => {
        expectDecimal128(decimalD.toDecimalPlaces(7), d);
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toDecimalPlaces(6), d);
    });
    test("round if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toDecimalPlaces(5), d);
    });
    test("round if number has more digits than requested (2)", () => {
        expectDecimal128(decimalD.toDecimalPlaces(4), d);
    });
    test("round if number has more digits than requested (3)", () => {
        expectDecimal128(decimalD.toDecimalPlaces(3), d);
    });
    test("round if number has more digits than requested (4)", () => {
        expectDecimal128(decimalD.toDecimalPlaces(2), "123.46");
    });
    test("round if number has more digits than requested (5)", () => {
        expectDecimal128(decimalD.toDecimalPlaces(1), "123.5");
    });
    test("zero decimal places", () => {
        expectDecimal128(decimalD.toDecimalPlaces(0), "123");
    });
    test("negative number of decimal places", () => {
        expect(() => decimalD.toDecimalPlaces(-1)).toThrow(RangeError);
    });
    test("non-integer number of decimal places", () => {
        expect(() => decimalD.toDecimalPlaces(1.5).toThrow(TypeError));
    });
});

describe("NaN", () => {
    expect(new Decimal128("NaN").toString()).toStrictEqual("NaN");
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toString()).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toString()).toStrictEqual(
            "-Infinity"
        );
    });
});
