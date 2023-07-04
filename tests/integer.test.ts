import { Decimal128 } from "../src/decimal128";

const zero = new Decimal128("0");

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(new Decimal128("123").isInteger());
    });
    test("looks like negative integer", () => {
        expect(new Decimal128("-456").isInteger());
    });
    test("zero is integer", () => {
        expect(zero.isInteger());
    });
    test("zero point zero is integer", () => {
        expect(new Decimal128("0.0").isInteger());
    });
    test("positive integer point zero is integer", () => {
        expect(new Decimal128("1234.0").isInteger());
    });
    test("negative integer point zero is integer", () => {
        expect(new Decimal128("-987.0").isInteger());
    });
    test("positive non-integer", () => {
        expect(new Decimal128("123.456").isInteger()).toBeFalsy();
    });
    test("negative non-integer", () => {
        expect(new Decimal128("-987.654").isInteger()).toBeFalsy();
    });
});
