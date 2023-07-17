import { Decimal128 } from "../src/decimal128.mjs";

describe("remainder", () => {
    let a = new Decimal128("4.1");
    let b = new Decimal128("1.25");
    test("simple example", () => {
        expect(Decimal128.remainder(a, b).toString()).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(Decimal128.remainder(a.negate(), b).toString()).toStrictEqual(
            "-0.35"
        );
    });
    test("negative argument", () => {
        expect(Decimal128.remainder(a, b.negate()).toString()).toStrictEqual(
            "0.35"
        );
    });
    test("negative, with negative argument", () => {
        expect(
            Decimal128.remainder(a.negate(), b.negate()).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(() =>
            Decimal128.remainder(new Decimal128("42"), new Decimal128("0"))
        ).toThrow(RangeError);
    });
    test("cleanly divides", () => {
        let ten = new Decimal128("10");
        let five = new Decimal128("5");
        expect(Decimal128.remainder(ten, five).toString()).toStrictEqual("0");
    });
});
