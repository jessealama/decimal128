import { Decimal128 } from "../src/decimal128.mjs";

const zero = new Decimal128("0");

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(Decimal128.isInteger(new Decimal128("123"))).toStrictEqual(true);
    });
    test("looks like negative integer", () => {
        expect(Decimal128.isInteger(new Decimal128("-456"))).toStrictEqual(
            true
        );
    });
    test("zero is integer", () => {
        expect(Decimal128.isInteger(zero)).toStrictEqual(true);
    });
    test("positive integer point zero is integer", () => {
        expect(Decimal128.isInteger(new Decimal128("1234.0"))).toStrictEqual(
            true
        );
    });
    test("negative integer point zero is integer", () => {
        expect(Decimal128.isInteger(new Decimal128("-987.0"))).toStrictEqual(
            true
        );
    });
    test("positive non-integer", () => {
        expect(Decimal128.isInteger(new Decimal128("123.456"))).toStrictEqual(
            false
        );
    });
    test("negative non-integer", () => {
        expect(Decimal128.isInteger(new Decimal128("-987.654"))).toStrictEqual(
            false
        );
    });
});
