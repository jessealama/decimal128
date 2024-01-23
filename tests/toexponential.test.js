import { Decimal128 } from "../src/decimal128.mjs";

describe("to exponential string", () => {
    test("one", () => {
        expect(new Decimal128("1").toExponential()).toStrictEqual("1E+0");
    });
    test("zero", () => {
        expect(new Decimal128("0").toExponential()).toStrictEqual("0E+0");
    });
    test("minus zero", () => {
        expect(new Decimal128("-0").toExponential()).toStrictEqual(
            "-0E+0"
        );
    });
    test("integer", () => {
        expect(new Decimal128("42").toExponential()).toStrictEqual(
            "4.2E+1"
        );
    });

    test("round trip", () => {
        expect(new Decimal128("4.2E+0").toExponential()).toStrictEqual(
            "4.2E+0"
        );
    });

    test("significant has one digit", () => {
        expect(new Decimal128("1").toExponential()).toStrictEqual("1E+0");
    });
    test("negative exponent", () => {
        expect(new Decimal128("0.1").toExponential()).toStrictEqual(
            "1E-1"
        );
    });
    test("negative exponent, multiple digits", () => {
        expect(new Decimal128("0.01042").toExponential()).toStrictEqual(
            "1.042E-2"
        );
    });
});

describe("NaN", () => {
    expect(new Decimal128("NaN").toExponential()).toStrictEqual("NaN");
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toExponential()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toExponential()).toStrictEqual(
            "-Infinity"
        );
    });
});
