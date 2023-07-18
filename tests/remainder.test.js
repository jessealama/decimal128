import { Decimal } from "../src/decimal.mjs";

describe("remainder", () => {
    let a = "4.1";
    let b = "1.25";
    test("simple example", () => {
        expect(Decimal.remainder(a, b)).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(Decimal.remainder("-4.1", b)).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(Decimal.remainder(a, "-1.25")).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(Decimal.remainder("-4.1", "-1.25")).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(() => Decimal.remainder("42", "0")).toThrow(RangeError);
    });
    test("divide by minus zero", () => {
        expect(() => Decimal.remainder("42", "-0")).toThrow(RangeError);
    });
    test("cleanly divides", () => {
        expect(Decimal.remainder("10", "5")).toStrictEqual("0");
    });
});
