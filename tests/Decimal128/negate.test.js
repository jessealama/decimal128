import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("negate", () => {
    test("minus zero", () => {
        expect(new Decimal128("-0").negate().toString()).toStrictEqual("0");
    });
    test("zero", () => {
        expect(new Decimal128("0").negate().toString()).toStrictEqual("-0");
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").negate().toString()).toStrictEqual("NaN");
    });
    test("negative number", () => {
        expect(new Decimal128("-42.51").negate().toString()).toStrictEqual(
            "42.51"
        );
    });
    test("positive number", () => {
        expect(new Decimal128("42.51").negate().toString()).toStrictEqual(
            "-42.51"
        );
    });
    test("preserve trailing zeros", () => {
        expect(
            new Decimal128("-42.510")
                .negate()
                .toString({ preserveTrailingZeroes: true })
        ).toStrictEqual("42.510");
    });
    test("-Infinity", () => {
        expect(new Decimal128("-Infinity").negate().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("Infinity", () => {
        expect(new Decimal128("Infinity").negate().toString()).toStrictEqual(
            "-Infinity"
        );
    });
    test("limit of digits", () => {
        expect(
            new Decimal128("-" + bigDigits).negate().toString()
        ).toStrictEqual(bigDigits);
    });
});
