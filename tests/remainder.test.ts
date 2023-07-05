import { Decimal128 } from "../src/decimal128";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("4.1"),
                new Decimal128("1.25")
            ).toString()
        ).toStrictEqual("0.82");
    });
    test("negative, with positive argument", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("-4.1"),
                new Decimal128("1.25")
            ).toString()
        ).toStrictEqual("0.82");
    });
    test("negative, with negative argument", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("-4.1"),
                new Decimal128("-1.25")
            ).toString()
        ).toStrictEqual("0.82");
    });
    test("divide by zero", () => {
        expect(() =>
            Decimal128.remainder(new Decimal128("42"), new Decimal128("0"))
        ).toThrow(RangeError);
    });
});
