import { Decimal128 } from "../src/decimal128.mjs";

describe("is-negative", () => {
    test("simple negative example", () => {
        expect(new Decimal128("-123.456").isNegative).toStrictEqual(true);
    });
    test("zero is not negative", () => {
        expect(new Decimal128("0").isNegative).toStrictEqual(false);
    });
    test("simple positive example", () => {
        expect(new Decimal128("123.456").isNegative).toStrictEqual(false);
    });
});
