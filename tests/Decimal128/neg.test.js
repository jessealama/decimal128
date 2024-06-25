import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal128("0");
const minusZero = new Decimal128("-0");
const one = new Decimal128("1");
const minusOne = new Decimal128("-1");
const two = new Decimal128("2");

describe("neg", () => {
    test("minus zero", () => {
        expect(new Decimal128("-0").neg().toString()).toStrictEqual("0");
    });
    test("zero", () => {
        expect(new Decimal128("0").neg().toString()).toStrictEqual("-0");
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").neg().toString()).toStrictEqual("NaN");
    });
    test("negative number", () => {
        expect(new Decimal128("-42.51").neg().toString()).toStrictEqual(
            "42.51"
        );
    });
    test("positive number", () => {
        expect(new Decimal128("42.51").neg().toString()).toStrictEqual(
            "-42.51"
        );
    });
    test("preserve trailing zeros", () => {
        expect(
            new Decimal128("-42.510").neg().toString({ normalize: false })
        ).toStrictEqual("42.510");
    });
    test("-Infinity", () => {
        expect(new Decimal128("-Infinity").neg().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("Infinity", () => {
        expect(new Decimal128("Infinity").neg().toString()).toStrictEqual(
            "-Infinity"
        );
    });
    test("limit of digits", () => {
        expect(new Decimal128("-" + bigDigits).neg().toString()).toStrictEqual(
            bigDigits
        );
    });
});
