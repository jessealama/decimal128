import { Decimal128 } from "../src/decimal128.mjs";

describe("negation", () => {
    test("positive number", () => {
        expect(new Decimal128("123.456").negate().toString()).toStrictEqual(
            "-123.456"
        );
    });
    test("negative number", () => {
        expect(new Decimal128("-123.456").negate().toString()).toStrictEqual(
            "123.456"
        );
    });
    test("zero", () => {
        expect(new Decimal128("0").negate().toString()).toStrictEqual("-0");
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").negate().toString()).toStrictEqual("0");
    });
});
