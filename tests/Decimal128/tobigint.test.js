import { Decimal128 } from "../../src/Decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("does not work", () => {
        expect(() => new Decimal128("NaN").toBigInt()).toThrow(RangeError);
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toBigInt()).toStrictEqual(0n);
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toBigInt()).toStrictEqual(0n);
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
        expect(new Decimal128("1.00").toBigInt()).toStrictEqual(1n);
    });
});

describe("simple examples", () => {
    test("42", () => {
        expect(new Decimal128("42").toBigInt()).toStrictEqual(42n);
    });
    test("-123", () => {
        expect(new Decimal128("-123").toBigInt()).toStrictEqual(-123n);
    });
});
