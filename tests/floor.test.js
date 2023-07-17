import { Decimal128 } from "../src/decimal128.mjs";

const zero = new Decimal128("0");

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(
            Decimal128.floor(new Decimal128("123.456")).toString()
        ).toStrictEqual("123");
        expect(
            Decimal128.floor(new Decimal128("-2.5")).toString()
        ).toStrictEqual("-2");
    });
    test("floor works (negative)", () => {
        expect(
            Decimal128.floor(new Decimal128("-123.456")).toString()
        ).toStrictEqual("-123");
    });
    test("floor of integer is unchanged", () => {
        expect(
            Decimal128.floor(new Decimal128("123")).toString()
        ).toStrictEqual("123");
    });
    test("floor of zero is unchanged", () => {
        expect(Decimal128.floor(zero).toString()).toStrictEqual("0");
    });
});
