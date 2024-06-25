import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal128("0");
const minusZero = new Decimal128("-0");
const one = new Decimal128("1");
const minusOne = new Decimal128("-1");
const two = new Decimal128("2");

describe("abs", () => {
    test("minus zero", () => {
        expect(new Decimal128("-0").abs().toString()).toStrictEqual("0");
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").abs().toString()).toStrictEqual("NaN");
    });
    test("-Infinity", () => {
        expect(new Decimal128("-Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("Infinity", () => {
        expect(new Decimal128("Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("limit of digits", () => {
        expect(new Decimal128("-" + bigDigits).abs().toString()).toStrictEqual(
            bigDigits
        );
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("2.1", () => {
        expect(new Decimal128("2.1").abs().toString()).toStrictEqual("2.1");
    });
    test("-100", () => {
        expect(new Decimal128("-100").abs().toString()).toStrictEqual("100");
    });
    test("101.5", () => {
        expect(new Decimal128("101.5").abs().toString()).toStrictEqual("101.5");
    });
    test("-101.5", () => {
        expect(new Decimal128("-101.5").abs().toString()).toStrictEqual(
            "101.5"
        );
    });
});
