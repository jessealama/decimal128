import { Decimal } from "../src/decimal.mjs";

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(Decimal.abs("123.456")).toStrictEqual("123.456");
    });
    test("simple negative case", () => {
        expect(Decimal.abs("-123.456")).toStrictEqual("123.456");
    });
});
