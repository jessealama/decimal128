import { Decimal128 } from "../src/decimal128.mjs";

describe("reciprocal", () => {
    test("divide by zero", () => {
        expect(new Decimal128("0").reciprocal().toString()).toStrictEqual(
            "NaN"
        );
    });
    test("one divided by one", () => {
        expect(new Decimal128("1").reciprocal().toString()).toStrictEqual("1");
    });
    test("one divided by two", () => {
        expect(new Decimal128("2").reciprocal().toString()).toStrictEqual(
            "0.5"
        );
    });
    test("reciprocal of point two", () => {
        expect(new Decimal128("0.2").reciprocal().toString()).toStrictEqual(
            "5"
        );
    });
    test("receiprocal of three", () => {
        expect(new Decimal128("3").reciprocal().toString()).toStrictEqual(
            "0.3333333333333333333333333333333333"
        );
    });
    test("reciprocal of point three", () => {
        expect(new Decimal128("0.3").reciprocal().toString()).toStrictEqual(
            "3.333333333333333333333333333333333"
        );
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").reciprocal().toString()).toStrictEqual(
            "NaN"
        );
    });
    test("positive infinity", () => {
        expect(
            new Decimal128("Infinity").reciprocal().toString()
        ).toStrictEqual("0");
    });
    test("negative infinity", () => {
        expect(
            new Decimal128("-Infinity").reciprocal().toString()
        ).toStrictEqual("-0");
    });
});
