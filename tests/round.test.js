import { Decimal128 } from "../src/decimal128.mjs";

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(new Decimal128("1.5").round().toString()).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(new Decimal128("2.5").round().toString()).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(new Decimal128("2.6").round().toString()).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(new Decimal128("-1.5").round().toString()).toStrictEqual(
                "-2"
            );
        });
        test("negative even", () => {
            expect(new Decimal128("-2.5").round().toString()).toStrictEqual(
                "-2"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.1").round().toString()).toStrictEqual("1");
        });
    });
    describe("round to one decimal place, with one decimal place available", () => {
        test("positive odd", () => {
            expect(new Decimal128("1.5").round(1).toString()).toStrictEqual(
                "2"
            );
        });
        test("positive even", () => {
            expect(new Decimal128("2.5").round(1).toString()).toStrictEqual(
                "2"
            );
        });
        test("round up (positive)", () => {
            expect(new Decimal128("2.6").round(1).toString()).toStrictEqual(
                "3"
            );
        });
        test("negative odd", () => {
            expect(new Decimal128("-1.5").round(1).toString()).toStrictEqual(
                "-2"
            );
        });
        test("negative even", () => {
            expect(new Decimal128("-2.5").round(1).toString()).toStrictEqual(
                "-2"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.1").round(1).toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("round to one decimal place, more than one decimal place available", () => {
        test("positive odd", () => {
            expect(new Decimal128("1.75").round(1).toString()).toStrictEqual(
                "1.8"
            );
        });
        test("positive even", () => {
            expect(new Decimal128("2.55").round(1).toString()).toStrictEqual(
                "2.6"
            );
        });
        test("round up (positive)", () => {
            expect(new Decimal128("2.26").round(1).toString()).toStrictEqual(
                "2.3"
            );
        });
        test("negative odd", () => {
            expect(new Decimal128("-1.95").round(1).toString()).toStrictEqual(
                "-2"
            );
        });
        test("negative even", () => {
            expect(new Decimal128("-2.65").round(1).toString()).toStrictEqual(
                "-2.6"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.81").round(1).toString()).toStrictEqual(
                "1.8"
            );
        });
    });
    test("round integer", () => {
        expect(new Decimal128("42").round(6).toString()).toStrictEqual("42");
    });
});
