import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expect(
            Decimal128.subtract(
                new Decimal128("123.456"),
                new Decimal128("0.456")
            ).toString()
        ).toStrictEqual("123");
    });
    test("minus negative number", () => {
        expect(
            Decimal128.subtract(
                new Decimal128("0.1"),
                new Decimal128("-0.2")
            ).toString()
        ).toStrictEqual("0.3");
    });
    test("subtract two negatives", () => {
        expect(
            Decimal128.subtract(
                new Decimal128("-1.9"),
                new Decimal128("-2.7")
            ).toString()
        ).toStrictEqual("0.8");
    });
    test("close to range limit", () => {
        expect(
            Decimal128.subtract(
                new Decimal128(bigDigits),
                new Decimal128("9")
            ).toString()
        ).toStrictEqual("9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0");
    });
    test("integer overflow", () => {
        expect(() =>
            Decimal128.subtract(
                new Decimal128("-" + bigDigits),
                new Decimal128("9")
            )
        ).toThrow(RangeError);
    });
});
