import { Decimal128 } from "../src/decimal128.mjs";

describe("normalize", () => {
    test("simple example", () => {
        expect(new Decimal128("1.20").normalize().toString()).toStrictEqual(
            "1.2"
        );
    });
    test("negative", () => {
        expect(new Decimal128("-1.20").normalize().toString()).toStrictEqual(
            "-1.2"
        );
    });
    test("infinity", () => {
        expect(new Decimal128("Infinity").normalize().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(
            new Decimal128("-Infinity").normalize().toString()
        ).toStrictEqual("-Infinity");
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").normalize().toString()).toStrictEqual(
            "NaN"
        );
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").normalize().toString()).toStrictEqual("-0");
    });
    test("minus zero point zero", () => {
        expect(new Decimal128("-0.0").normalize().toString()).toStrictEqual(
            "-0"
        );
    });
    test("multiple zeros", () => {
        expect(
            new Decimal128("42.5678990000").normalize().toString()
        ).toStrictEqual("42.567899");
    });
});
