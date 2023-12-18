import { Decimal128 } from "../src/decimal128.mjs";

describe("square root", () => {
    test("zero", () => {
        expect(new Decimal128("0").squareRoot().toString()).toStrictEqual("0");
    });
    test("negative throws", () => {
        expect(() => new Decimal128("-1").squareRoot()).toThrow();
    });
    test("one", () => {
        expect(new Decimal128("1").squareRoot().toString()).toStrictEqual("1");
    });
    test("four", () => {
        expect(new Decimal128("4").squareRoot().toString()).toStrictEqual("2");
    });
    test("nine", () => {
        expect(new Decimal128("9").squareRoot().toString()).toStrictEqual("3");
    });
    test("two", () => {
        expect(new Decimal128("2").squareRoot().toString()).toStrictEqual(
            "1.414213562373095048801688724209698"
        );
    });
    test("less than one, exact", () => {
        expect(new Decimal128("0.25").squareRoot().toString()).toStrictEqual(
            "0.5"
        );
    });
    test("two digits", () => {
        expect(new Decimal128("49").squareRoot().toString()).toStrictEqual("7");
    });
    test("one digit on the right", () => {
        expect(new Decimal128("0.9").squareRoot().toString()).toStrictEqual(
            "0.3"
        );
    });
});
