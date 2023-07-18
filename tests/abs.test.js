import { Decimal128 } from "../src/decimal128.mjs";

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(Decimal128.abs("123.456")).toStrictEqual("123.456");
    });
    test("simple negative case", () => {
        expect(Decimal128.abs("-123.456")).toStrictEqual("123.456");
    });
});
