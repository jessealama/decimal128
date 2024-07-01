import { Decimal128 } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal128("NaN").isSubnormal()).toThrow(RangeError);
    });
});

describe("infinity", () => {
    test("positive throws", () => {
        expect(() => new Decimal128("Infinity").isSubnormal()).toThrow(
            RangeError
        );
    });
    test("negative throws", () => {
        expect(() => new Decimal128("-Infinity").isSubnormal()).toThrow(
            RangeError
        );
    });
});

describe("limits", () => {
    test("simple number is not subnormal", () => {
        expect(new Decimal128("42").isSubnormal()).toStrictEqual(false);
    });
    test("zero is not subnormal", () => {
        expect(() => new Decimal128("0").isSubnormal()).toThrow(RangeError);
    });
    test("simple number with exponent at limit", () => {
        expect(new Decimal128("42E-6144").isSubnormal()).toStrictEqual(false);
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal128("42E-6145").isSubnormal()).toStrictEqual(true);
    });
});
