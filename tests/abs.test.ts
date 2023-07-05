import { Decimal128 } from "../src/decimal128";

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(
            Decimal128.abs(new Decimal128("123.456")).toString()
        ).toStrictEqual("123.456");
    });
    test("simple negative case", () => {
        expect(
            Decimal128.abs(new Decimal128("-123.456")).toString()
        ).toStrictEqual("123.456");
    });
});
