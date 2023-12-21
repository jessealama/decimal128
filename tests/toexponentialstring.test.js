import { Decimal128 } from "../src/decimal128.mjs";

describe("to exponential string", () => {
    test("one", () => {
        expect(new Decimal128("1").toExponentialString()).toStrictEqual("1E+0");
    });
    test("zero", () => {
        expect(new Decimal128("0").toExponentialString()).toStrictEqual("0E+0");
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").toExponentialString()).toStrictEqual(
            "-0E+0"
        );
    });
    test("integer", () => {
        expect(new Decimal128("42").toExponentialString()).toStrictEqual(
            "4.2E+1"
        );
    });

    test("round trip", () => {
        expect(new Decimal128("4.2E+0").toExponentialString()).toStrictEqual(
            "4.2E+0"
        );
    });

    test("significant has one digit", () => {
        expect(new Decimal128("1").toExponentialString()).toStrictEqual("1E+0");
    });
});

describe("NaN", () => {
    expect(new Decimal128("NaN").toExponentialString()).toStrictEqual("NaN");
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toExponentialString()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toExponentialString()).toStrictEqual(
            "-Infinity"
        );
    });
});
