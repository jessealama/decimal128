import { Decimal128 } from "../src/decimal128.mjs";

const zero = new Decimal128("0");

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(new Decimal128("123.456").floor().toString()).toStrictEqual(
            "123"
        );
        expect(new Decimal128("-2.5").floor().toString()).toStrictEqual("-2");
    });
    test("floor works (negative)", () => {
        expect(new Decimal128("-123.456").floor().toString()).toStrictEqual(
            "-123"
        );
    });
    test("floor of integer is unchanged", () => {
        expect(new Decimal128("123").floor().toString()).toStrictEqual("123");
    });
    test("floor of zero is unchanged", () => {
        expect(zero.floor().toString()).toStrictEqual("0");
    });
});
