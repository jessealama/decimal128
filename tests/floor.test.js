import { Decimal128 } from "../src/decimal128.mjs";

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(Decimal128.floor("123.456")).toStrictEqual("123");
        expect(Decimal128.floor("-2.5")).toStrictEqual("-2");
    });
    test("floor works (negative)", () => {
        expect(Decimal128.floor("-123.456")).toStrictEqual("-123");
    });
    test("floor of integer is unchanged", () => {
        expect(Decimal128.floor("123")).toStrictEqual("123");
    });
    test("floor of zero is unchanged", () => {
        expect(Decimal128.floor("0")).toStrictEqual("0");
    });
});
