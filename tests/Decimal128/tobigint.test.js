import JSBI from "jsbi";
import { Decimal128 } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    test("does not work", () => {
        expect(() => new Decimal128("NaN").toBigInt()).toThrow(RangeError);
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toBigInt()).toStrictEqual(JSBI.BigInt(0));
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toBigInt()).toStrictEqual(JSBI.BigInt(0));
    });
});

describe("infinity", () => {
    test("positive", () => {
        expect(() => new Decimal128("Infinity").toBigInt()).toThrow(RangeError);
    });
    test("negative", () => {
        expect(() => new Decimal128("-Infinity").toBigInt()).toThrow(
            RangeError
        );
    });
});

describe("non-integer", () => {
    test("throws", () => {
        expect(() => new Decimal128("1.2").toBigInt()).toThrow(RangeError);
    });
    test("work with mathematical value (ignore trailing zeroes)", () => {
        expect(new Decimal128("1.00").toBigInt()).toStrictEqual(JSBI.BigInt(1));
    });
});

describe("simple examples", () => {
    test("42", () => {
        expect(new Decimal128("42").toBigInt()).toStrictEqual(JSBI.BigInt(42));
    });
    test("-123", () => {
        expect(new Decimal128("-123").toBigInt()).toStrictEqual(
            JSBI.BigInt(-123)
        );
    });
});
