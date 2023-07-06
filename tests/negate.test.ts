import { Decimal128 } from "../src/decimal128";

describe("negate", function () {
    test("simple positive case", () => {
        expect(new Decimal128("123.456").negate().toString()).toStrictEqual(
            "-123.456"
        );
    });
    test("simple negative case", () => {
        expect(new Decimal128("-123.456").negate().toString()).toStrictEqual(
            "123.456"
        );
    });
});
