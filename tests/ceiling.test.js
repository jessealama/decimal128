import { Decimal128 } from "../src/decimal128.mjs";

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(Decimal128.ceil("123.456")).toStrictEqual("124");
    });
    test("ceiling works (negative)", () => {
        expect(Decimal128.ceil("-123.456")).toStrictEqual("-123");
    });
    test("ceiling of an integer is unchanged", () => {
        expect(Decimal128.ceil("123")).toStrictEqual("123");
    });
});
