import { Decimal128 } from "../src/decimal128.mjs";

describe("square root", () => {
    test("zero", () => {
        expect(Decimal128.squareRoot("0")).toStrictEqual("0");
    });
    test("negative throws", () => {
        expect(() => Decimal128.squareRoot("-1")).toThrow();
    });
    test("one", () => {
        expect(Decimal128.squareRoot("1")).toStrictEqual("1");
    });
    test("four", () => {
        expect(Decimal128.squareRoot("4")).toStrictEqual("2");
    });
    test("nine", () => {
        expect(Decimal128.squareRoot("9")).toStrictEqual("3");
    });
    test("two", () => {
        expect(Decimal128.squareRoot("2").toString()).toStrictEqual(
            "1.414213562373095048801688724209698"
        );
    });
    test("less than one, exact", () => {
        expect(Decimal128.squareRoot("0.25").toString()).toStrictEqual("0.5");
    });
    test("two digits", () => {
        expect(Decimal128.squareRoot("49")).toStrictEqual("7");
    });
    test("one digit on the right", () => {
        expect(Decimal128.squareRoot("0.9")).toStrictEqual("0.3");
    });
});
