import { Decimal128 } from "../src/decimal128.mjs";

describe("remainder", () => {
    let a = new Decimal128("4.1");
    let b = new Decimal128("1.25");
    test("simple example", () => {
        expect(a.remainder(b).toString()).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(a.negate().remainder(b).toString()).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(a.remainder(b.negate()).toString()).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(a.negate().remainder(b.negate()).toString()).toStrictEqual(
            "-0.35"
        );
    });
    test("divide by zero", () => {
        expect(() =>
            new Decimal128("42").remainder(new Decimal128("0"))
        ).toThrow(RangeError);
    });
    test("cleanly divides", () => {
        let ten = new Decimal128("10");
        let five = new Decimal128("5");
        expect(ten.remainder(five).toString()).toStrictEqual("0");
    });
});
