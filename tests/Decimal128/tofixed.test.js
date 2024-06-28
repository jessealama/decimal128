import { Decimal128 } from "../../src/Decimal128.mjs";
import { expectDecimal128 } from "./util.js";
import { Decimal } from "../../src/Decimal.mjs";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toFixed()).toStrictEqual("NaN");
    });
    test("works, digits reqwusted", () => {
        expect(new Decimal128("NaN").toFixed({ digits: 77 })).toStrictEqual(
            "NaN"
        );
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
    test("positive infinity, digits requested", () => {
        expect(
            new Decimal128("Infinity").toFixed({ digits: 42 })
        ).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toFixed()).toStrictEqual(
            "-Infinity"
        );
    });
    test("negative infinity, digits requested", () => {
        expect(
            new Decimal128("-Infinity").toFixed({ digits: 55 })
        ).toStrictEqual("-Infinity");
    });
});

describe("to decimal places", function () {
    const d = "123.456";
    const decimalD = new Decimal128(d);
    test("no argument", () => {
        expectDecimal128(decimalD.toFixed(), "123.456");
    });
    test("digits option is present but value is undefined", () => {
        expectDecimal128(decimalD.toFixed({ digits: undefined }), "123.456");
    });
    test("more digits than available means digits get added", () => {
        expectDecimal128(decimalD.toFixed({ digits: 4 }), "123.4560");
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toFixed({ digits: 3 }), "123.456");
    });
    test("cutoff with rounding if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toFixed({ digits: 2 }), "123.46");
    });
    test("cutoff if number has more digits than requested (no rounding)", () => {
        expectDecimal128(decimalD.toFixed({ digits: 1 }), "123.4");
    });
    test("zero decimal places", () => {
        expectDecimal128(decimalD.toFixed({ digits: 0 }), "123");
    });
    test("zero decimal places for integer", () => {
        expectDecimal128(new Decimal128("42").toFixed({ digits: 0 }), "42");
    });
    test("negative number of decimal places throws", () => {
        expect(() => decimalD.toFixed({ digits: -1 })).toThrow(RangeError);
    });
    test("non-integer does not take floor", () => {
        expect(() => decimalD.toFixed({ digits: 1.5 })).toThrow(RangeError);
    });
    test("non-object argument", () => {
        expect(() => decimalD.toFixed("flab")).toThrow(TypeError);
    });
    test("zeroes get added", () => {
        expect(new Decimal128("42").toFixed({ digits: 10 })).toStrictEqual(
            "42.0000000000"
        );
    });
});
