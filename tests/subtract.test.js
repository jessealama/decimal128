import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expectDecimal128(
            new Decimal128("123.456").subtract(new Decimal128("0.456")),
            "123"
        );
    });
    test("minus negative number", () => {
        expectDecimal128(
            new Decimal128("0.1").subtract(new Decimal128("-0.2")),
            "0.3"
        );
    });
    test("subtract two negatives", () => {
        expectDecimal128(
            new Decimal128("-1.9").subtract(new Decimal128("-2.7")),
            "0.8"
        );
    });
    const big = new Decimal128(bigDigits);
    test("close to range limit", () => {
        expectDecimal128(
            big.subtract(new Decimal128("9")),
            "9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0"
        );
    });
    test("integer overflow", () => {
        expect(() =>
            new Decimal128("-" + bigDigits).subtract(new Decimal128("9"))
        ).toThrow(RangeError);
    });
    describe("NaN", () => {
        test("NaN minus NaN is NaN", () => {
            expect(
                new Decimal128("NaN").subtract(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN minus number", () => {
            expect(
                new Decimal128("NaN").subtract(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number minus NaN", () => {
            expect(
                new Decimal128("1").subtract(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
});
