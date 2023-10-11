import { Decimal128 } from "../src/decimal128.mjs";

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(new Decimal128("123.456").abs().toString()).toStrictEqual(
            "123.456"
        );
    });
    test("simple negative case", () => {
        expect(new Decimal128("-123.456").abs().toString()).toStrictEqual(
            "123.456"
        );
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").abs().toString()).toStrictEqual("NaN");
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").abs().toString()).toStrictEqual("0");
    });
    test("minus infinity", () => {
        expect(new Decimal128("-Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
});
