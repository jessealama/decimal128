import { Decimal128 } from "../src/decimal128.mts";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toString()).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toString()).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toString()).toStrictEqual("-0");
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toString()).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toString()).toStrictEqual(
            "-Infinity"
        );
    });
});

describe("to decimal places", function () {
    const d = "123.456";
    const decimalD = new Decimal128(d);
    test("more digits than available means digits get added", () => {
        expectDecimal128(
            decimalD.toString({ numDecimalDigits: 4 }),
            "123.4560"
        );
    });
    test("same number of digits as available means no change", () => {
        expectDecimal128(decimalD.toString({ numDecimalDigits: 3 }), "123.456");
    });
    test("cutoff if number has more digits than requested (1)", () => {
        expectDecimal128(decimalD.toString({ numDecimalDigits: 2 }), "123.45");
    });
    test("cutoff if number has more digits than requested (2)", () => {
        expectDecimal128(decimalD.toString({ numDecimalDigits: 1 }), "123.4");
    });
    test("zero decimal places", () => {
        expectDecimal128(decimalD.toString({ numDecimalDigits: 0 }), "123");
    });
    test("negative number of decimal places", () => {
        expect(decimalD.toString({ numDecimalDigits: -1 })).toStrictEqual(
            "123.456"
        );
    });
    test("non-integer number of decimal places reverts to default", () => {
        expect(decimalD.toString({ numDecimalDigits: 1.5 })).toStrictEqual(
            "123.456"
        );
    });
});

describe("to exponential string", () => {
    test("one", () => {
        expect(
            new Decimal128("1").toString({ format: "exponential" })
        ).toStrictEqual("1E+0");
    });
    test("zero", () => {
        expect(
            new Decimal128("0").toString({ format: "exponential" })
        ).toStrictEqual("0E+0");
    });
    test("minus zero", () => {
        expect(
            new Decimal128("-0").toString({ format: "exponential" })
        ).toStrictEqual("-0E+0");
    });
    test("integer", () => {
        expect(
            new Decimal128("42").toString({ format: "exponential" })
        ).toStrictEqual("4.2E+1");
    });

    test("round trip", () => {
        expect(
            new Decimal128("4.2E+0").toString({ format: "exponential" })
        ).toStrictEqual("4.2E+0");
    });

    test("significant has one digit", () => {
        expect(
            new Decimal128("1").toString({ format: "exponential" })
        ).toStrictEqual("1E+0");
    });
    test("negative exponent", () => {
        expect(
            new Decimal128("0.1").toString({ format: "exponential" })
        ).toStrictEqual("1E-1");
    });
    test("negative exponent, multiple digits", () => {
        expect(
            new Decimal128("0.01042").toString({ format: "exponential" })
        ).toStrictEqual("1.042E-2");
    });
});

describe("normalization", () => {
    test("on by default", () => {
        expect(new Decimal128("1.20").toString()).toStrictEqual("1.2");
    });
    test("can be disabled", () => {
        expect(
            new Decimal128("1.20").toString({ normalize: false })
        ).toStrictEqual("1.20");
    });
});
