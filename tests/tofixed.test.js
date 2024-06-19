import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toFixed()).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toFixed()).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toFixed()).toStrictEqual("-0");
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toFixed()).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toFixed()).toStrictEqual(
            "-Infinity"
        );
    });
});

describe("to decimal places", function () {
    const d = "123.456";
    const decimalD = new Decimal128(d);
    test("more digits than available means digits get added", () => {
        expectDecimal128(decimalD.toFixed(4), "123.4560");
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toFixed(3), "123.456");
    });
    test("cutoff with rounding if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toFixed(2), "123.46");
    });
    test("cutoff if number has more digits than requested (no rounding)", () => {
        expectDecimal128(decimalD.toFixed(1), "123.4");
    });
    test("zero decimal places", () => {
        expectDecimal128(decimalD.toFixed(0), "123");
    });
    test("negative number of decimal places throws", () => {
        expect(() => decimalD.toFixed(-1)).toThrow(RangeError);
    });
    test("non-integer takes floor", () => {
        expect(decimalD.toFixed(1.5)).toStrictEqual("123.4");
    });
});
