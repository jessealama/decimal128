import { Decimal128 } from "../../src/Decimal128.mjs";
import { Decimal } from "../../src/Decimal.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal128("NaN").scale10(5)).toThrow(RangeError);
    });
});

describe("simple examples", () => {
    test("0", () => {
        expect(new Decimal128("0").scale10(4).toString()).toStrictEqual("0");
    });
    test("42, 4", () => {
        expect(new Decimal128("42").scale10(4).toString()).toStrictEqual(
            "420000"
        );
    });
    test("42, -4", () => {
        expect(new Decimal128("42").scale10(-4).toString()).toStrictEqual(
            "0.0042"
        );
    });
    test("zero", () => {
        expect(new Decimal128("42").scale10(0).toString()).toStrictEqual("42");
    });
    test("non-integer argument", () => {
        expect(() => new Decimal128("42").scale10(1.5)).toThrow(TypeError);
    });
});

describe("infinty", () => {
    test("positive infinity throws", () => {
        expect(() => new Decimal128("Infinity").scale10(5)).toThrow(RangeError);
    });
    test("negative infinity throws", () => {
        expect(() => new Decimal128("-Infinity").scale10(5)).toThrow(
            RangeError
        );
    });
});
