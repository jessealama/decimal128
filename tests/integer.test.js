import { Decimal128 } from "../src/decimal128.mjs";

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(new Decimal128("123").isInteger()).toStrictEqual(true);
    });
    test("looks like negative integer", () => {
        expect(new Decimal128("-456").isInteger()).toStrictEqual(true);
    });
    test("zero is integer", () => {
        expect(new Decimal128("0").isInteger()).toStrictEqual(true);
    });
    test("positive integer point zero is integer", () => {
        expect(new Decimal128("1234.0").isInteger()).toStrictEqual(true);
    });
    test("negative integer point zero is integer", () => {
        expect(new Decimal128("-987.0").isInteger()).toStrictEqual(true);
    });
    test("positive non-integer", () => {
        expect(new Decimal128("123.456").isInteger()).toStrictEqual(false);
    });
    test("negative non-integer", () => {
        expect(new Decimal128("-987.654").isInteger()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").isInteger()).toStrictEqual(false);
    });
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").isInteger()).toStrictEqual(false);
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").isInteger()).toStrictEqual(false);
    });
});
