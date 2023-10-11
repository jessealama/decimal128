import { Decimal128 } from "../src/decimal128.mjs";

describe("remainder", () => {
    let a = "4.1";
    let b = "1.25";
    test("simple example", () => {
        expect(
            new Decimal128(a).remainder(new Decimal128(b)).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128(b)).toString()
        ).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(
            new Decimal128(a).remainder(new Decimal128("-1.25")).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128("-1.25")).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(
            new Decimal128("42").remainder(new Decimal128("0")).toString()
        ).toStrictEqual("NaN");
    });
    test("divide by minus zero", () => {
        expect(
            new Decimal128("42").remainder(new Decimal128("-0")).toString()
        ).toStrictEqual("NaN");
    });
    test("cleanly divides", () => {
        expect(
            new Decimal128("10").remainder(new Decimal128("5")).toString()
        ).toStrictEqual("0");
    });
    describe("NaN", () => {
        test("NaN remainder NaN is NaN", () => {
            expect(
                new Decimal128("NaN")
                    .remainder(new Decimal128("NaN"))
                    .toString()
            ).toStrictEqual("NaN");
        });
        test("number remainder NaN is NaN", () => {
            expect(
                new Decimal128("1").remainder(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN remainder number is NaN", () => {
            expect(
                new Decimal128("NaN").remainder(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
});
