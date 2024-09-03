import { Decimal128 } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal128("NaN").isNormal()).toThrow(RangeError);
    });
});

describe("infinity", () => {
    test("positive throws", () => {
        expect(() => new Decimal128("Infinity").isNormal()).toThrow(RangeError);
    });
    test("negative throws", () => {
        expect(() => new Decimal128("-Infinity").isNormal()).toThrow(
            RangeError
        );
    });
});

describe("limits", () => {
    test("simple number is normal", () => {
        expect(new Decimal128("42").isNormal()).toStrictEqual(true);
    });
    test("zero is not normal", () => {
        expect(() => new Decimal128("0").isNormal()).toThrow(RangeError);
    });
    test("simple number with exponent at limit", () => {
        expect(new Decimal128("42E-6144").isNormal()).toStrictEqual(true);
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal128("42E-6145").isNormal()).toStrictEqual(false);
    });
});
