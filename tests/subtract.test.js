import { Decimal } from "../src/decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expect(Decimal.subtract("123.456", "0.456")).toStrictEqual("123");
    });
    test("minus negative number", () => {
        expect(Decimal.subtract("0.1", "-0.2")).toStrictEqual("0.3");
    });
    test("subtract two negatives", () => {
        expect(Decimal.subtract("-1.9", "-2.7")).toStrictEqual("0.8");
    });
    test("close to range limit", () => {
        expect(Decimal.subtract(bigDigits, "9")).toStrictEqual(
            "9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0"
        );
    });
    test("integer overflow", () => {
        expect(() => Decimal.subtract("-" + bigDigits, "9")).toThrow(
            RangeError
        );
    });
});
