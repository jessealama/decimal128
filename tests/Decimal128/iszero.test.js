import { Decimal128 } from "../../src/Decimal128.mjs";

describe("simple examples", () => {
    test("0", () => {
        expect(new Decimal128("0").isZero()).toStrictEqual(true);
    });
    test("0.00", () => {
        expect(new Decimal128("0.00").isZero()).toStrictEqual(true);
    });
    test("-0", () => {
        expect(new Decimal128("-0").isZero()).toStrictEqual(true);
    });
    test("-0.0", () => {
        expect(new Decimal128("-0.0").isZero()).toStrictEqual(true);
    });
    test("Infinity", () => {
        expect(new Decimal128("Infinity").isZero()).toStrictEqual(false);
    });
    test("-Infinity", () => {
        expect(new Decimal128("-Infinity").isZero()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").isZero()).toStrictEqual(false);
    });
    test("42", () => {
        expect(new Decimal128("42").isZero()).toStrictEqual(false);
    });
});
