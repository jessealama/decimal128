import { Decimal } from "../src/decimal.mjs";

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(Decimal.floor("123.456")).toStrictEqual("123");
        expect(Decimal.floor("-2.5")).toStrictEqual("-2");
    });
    test("floor works (negative)", () => {
        expect(Decimal.floor("-123.456")).toStrictEqual("-123");
    });
    test("floor of integer is unchanged", () => {
        expect(Decimal.floor("123")).toStrictEqual("123");
    });
    test("floor of zero is unchanged", () => {
        expect(Decimal.floor("0")).toStrictEqual("0");
    });
});
