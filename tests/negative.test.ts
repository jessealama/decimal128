import { Decimal128 } from "../src/decimal128";

const zero = new Decimal128("0");

describe("is-negative", () => {
    test("simple negative example", () => {
        expect(new Decimal128("-123.456").isNegative);
    });
    test("zero is not negative", () => {
        expect(zero.isNegative).toBeFalsy();
    });
    test("simple positive example", () => {
        expect(new Decimal128("123.456").isNegative).toBeFalsy();
    });
});
