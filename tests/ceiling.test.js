import { Decimal } from "../src/decimal.mjs";

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(Decimal.ceil("123.456")).toStrictEqual("124");
    });
    test("ceiling works (negative)", () => {
        expect(Decimal.ceil("-123.456")).toStrictEqual("-123");
    });
    test("ceiling of an integer is unchanged", () => {
        expect(Decimal.ceil("123")).toStrictEqual("123");
    });
});
