import { Decimal128 } from "../src/decimal128.mjs";

describe("pow", () => {
    test("throws if not an integer", () => {
        expect(() => {
            new Decimal128("1.2").pow(new Decimal128("2.3"));
        }).toThrow();
    });
    test("pow zero is one", () => {
        expect(
            new Decimal128("42.456").pow(new Decimal128("0")).toString()
        ).toStrictEqual("1");
    });
    test("negative power", () => {
        expect(
            new Decimal128("5.6").pow(new Decimal128("-2")).toString()
        ).toStrictEqual("0.031887755102040816326530612244898");
    });
    test("positive power", () => {
        expect(
            new Decimal128("5.6").pow(new Decimal128("8")).toString()
        ).toStrictEqual("967173.11574016");
    });
    describe("infinity", () => {
        test("positive infinity", () => {
            expect(
                new Decimal128("Infinity").pow(new Decimal128("2")).toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity squared", () => {
            expect(
                new Decimal128("-Infinity").pow(new Decimal128("2")).toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity cubed", () => {
            expect(
                new Decimal128("-Infinity").pow(new Decimal128("3")).toString()
            ).toStrictEqual("-Infinity");
        });
    });
    describe("NaN", () => {
        expect(() => new Decimal128("42").pow("NaN")).toThrow();
    });
});
