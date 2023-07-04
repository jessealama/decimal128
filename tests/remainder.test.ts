import { Decimal128 } from "../src/decimal128";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            new Decimal128("4.1").remainder(new Decimal128("1.25")).toString()
        ).toStrictEqual("0.82");
    });
    test("negative, with positive argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128("1.25")).toString()
        ).toStrictEqual("0.82");
    });
    test("negative, with negative argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128("-1.25")).toString()
        ).toStrictEqual("0.82");
    });
    test("divide by zero", () => {
        expect(() =>
            new Decimal128("123.456").remainder(new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
});
