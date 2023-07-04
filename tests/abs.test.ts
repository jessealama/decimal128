import { Decimal128 } from "../src/decimal128";

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(new Decimal128("123.456").abs().equals(new Decimal128("123")));
    });
    test("simple negative case", () => {
        expect(new Decimal128("-123.456").abs().equals(new Decimal128("123")));
    });
});
