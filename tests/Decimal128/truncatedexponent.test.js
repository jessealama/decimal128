import { Decimal128 } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal128("NaN").truncatedExponent()).toThrow(
            RangeError
        );
    });
});

describe("infinity", () => {
    test("positive throws", () => {
        expect(() => new Decimal128("Infinity").truncatedExponent()).toThrow(
            RangeError
        );
    });
    test("negative throws", () => {
        expect(() => new Decimal128("-Infinity").truncatedExponent()).toThrow(
            RangeError
        );
    });
});

describe("limits", () => {
    test("42", () => {
        expect(new Decimal128("42").truncatedExponent()).toStrictEqual(1);
    });
    test("4.2", () => {
        expect(new Decimal128("4.2").truncatedExponent()).toStrictEqual(0);
    });
    test("zero", () => {
        expect(new Decimal128("0").truncatedExponent()).toStrictEqual(-6143);
    });
    test("simple number, greater than 10, with exponent apparently at limit", () => {
        expect(new Decimal128("42E-6143").truncatedExponent()).toStrictEqual(
            -6142
        );
    });
    test("simple number between 1 and 10 with exponent apparently at limit", () => {
        expect(new Decimal128("4.22E-6143").truncatedExponent()).toStrictEqual(
            -6143
        );
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal128("4.22E-6144").truncatedExponent()).toStrictEqual(
            -6143
        );
    });
});
