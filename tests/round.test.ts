import { Decimal128 } from "../src/decimal128.mjs";

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(
                Decimal128.round(new Decimal128("1.5")).toString()
            ).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(
                Decimal128.round(new Decimal128("2.5")).toString()
            ).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("2.6")).toString()
            ).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(
                Decimal128.round(new Decimal128("-1.5")).toString()
            ).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(
                Decimal128.round(new Decimal128("-2.5")).toString()
            ).toStrictEqual("-2");
        });
        test("round down (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("1.1")).toString()
            ).toStrictEqual("1");
        });
    });
    describe("round to one decimal place, with one decimal place available", () => {
        test("positive odd", () => {
            expect(
                Decimal128.round(new Decimal128("1.5"), 1).toString()
            ).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(
                Decimal128.round(new Decimal128("2.5"), 1).toString()
            ).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("2.6"), 1).toString()
            ).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(
                Decimal128.round(new Decimal128("-1.5"), 1).toString()
            ).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(
                Decimal128.round(new Decimal128("-2.5"), 1).toString()
            ).toStrictEqual("-2");
        });
        test("round down (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("1.1"), 1).toString()
            ).toStrictEqual("1");
        });
    });
    describe("round to one decimal place, more than one decimal place available", () => {
        test("positive odd", () => {
            expect(
                Decimal128.round(new Decimal128("1.75"), 1).toString()
            ).toStrictEqual("1.8");
        });
        test("positive even", () => {
            expect(
                Decimal128.round(new Decimal128("2.55"), 1).toString()
            ).toStrictEqual("2.6");
        });
        test("round up (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("2.26"), 1).toString()
            ).toStrictEqual("2.3");
        });
        test("negative odd", () => {
            expect(
                Decimal128.round(new Decimal128("-1.95"), 1).toString()
            ).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(
                Decimal128.round(new Decimal128("-2.65"), 1).toString()
            ).toStrictEqual("-2.6");
        });
        test("round down (positive)", () => {
            expect(
                Decimal128.round(new Decimal128("1.81"), 1).toString()
            ).toStrictEqual("1.8");
        });
    });
    test("round integer", () => {
        expect(
            Decimal128.round(new Decimal128("42"), 6).toString()
        ).toStrictEqual("42");
    });
});
