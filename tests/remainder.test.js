import { Decimal128 } from "../src/decimal128.mjs";

describe("remainder", () => {
    let a = "4.1";
    let b = "1.25";
    test("simple example", () => {
        expect(Decimal128.remainder(a, b)).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(Decimal128.remainder("-4.1", b)).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(Decimal128.remainder(a, "-1.25")).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(Decimal128.remainder("-4.1", "-1.25")).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(() => Decimal128.remainder("42", "0")).toThrow(RangeError);
    });
    test("divide by minus zero", () => {
        expect(() => Decimal128.remainder("42", "-0")).toThrow(RangeError);
    });
    test("cleanly divides", () => {
        expect(Decimal128.remainder("10", "5")).toStrictEqual("0");
    });
});
