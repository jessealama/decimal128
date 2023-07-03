import { Decimal128 } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const one = new Decimal128("1");
const two = new Decimal128("2");
const three = new Decimal128("3");
const four = new Decimal128("4");
const ten = new Decimal128("10");

let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expect(
            new Decimal128("123.456")
                .subtract(new Decimal128("0.456"))
                .toString()
        ).toStrictEqual("123");
    });
    test("minus negative number", () => {
        expect(
            new Decimal128("0.1").subtract(new Decimal128("-0.2")).toString()
        ).toStrictEqual("0.3");
    });
    test("subtract two negatives", () => {
        expect(
            new Decimal128("-1.9").subtract(new Decimal128("-2.7")).toString()
        ).toStrictEqual("0.8");
    });
    test("close to range limit", () => {
        expect(
            new Decimal128(bigDigits).subtract(new Decimal128("9")).toString()
        ).toStrictEqual("9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0");
    });
    test("integer overflow", () => {
        expect(() =>
            new Decimal128("-" + bigDigits).subtract(new Decimal128("9"))
        ).toThrow(RangeError);
    });
});
