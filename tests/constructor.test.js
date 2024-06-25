import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("constructor", () => {
    describe("digit string syntax", () => {
        test("sane string works", () => {
            expect(new Decimal128("123.456")).toBeInstanceOf(Decimal128);
        });
        test("normalization by default", () => {
            expect(new Decimal128("1.20").toString()).toStrictEqual("1.2");
        });
        test("string with underscores in integer part", () => {
            expect(new Decimal128("123_456.789").toString()).toStrictEqual(
                "123456.789"
            );
        });
        test("string with multiple underscores in integer part", () => {
            expect(new Decimal128("123_456_789.123").toString()).toStrictEqual(
                "123456789.123"
            );
        });
        test("string with underscore in decimal part", () => {
            expect(new Decimal128("123.456_789").toString()).toStrictEqual(
                "123.456789"
            );
        });
        test("string with underscores in both integer and decimal part", () => {
            expect(new Decimal128("123_456.789_123").toString()).toStrictEqual(
                "123456.789123"
            );
        });
        test("negative works", () => {
            expect(new Decimal128("-123.456")).toBeInstanceOf(Decimal128);
        });
        test("integer works (decimal point unnecessary)", () => {
            expect(new Decimal128("123")).toBeInstanceOf(Decimal128);
        });
        test("more significant digits than we can store is not OK for integers", () => {
            expect(
                () => new Decimal128("123456789123456789123456789123456789")
            ).toThrow(RangeError);
        });
        test("five as last digit past limit: tie to even unchanged", () => {
            expect(
                new Decimal128("1234567890123456789012345678901234.5").toString(
                    { format: "decimal" }
                )
            ).toStrictEqual("1234567890123456789012345678901234");
        });
        test("five as last digit past limit: tie to even round up", () => {
            expect(
                new Decimal128("1234567890123456789012345678901235.5").toString(
                    { format: "decimal" }
                )
            ).toStrictEqual("1234567890123456789012345678901236");
        });
        test("five as last digit past limit: tie to even round up, penultimate digit is 9", () => {
            expect(
                new Decimal128("1234567890123456789012345678901239.5").toString(
                    { format: "decimal" }
                )
            ).toStrictEqual("1234567890123456789012345678901240");
        });
        test("five as last digit past limit: tie to even round up, penultimate digit is 9 (negative)", () => {
            expect(
                new Decimal128(
                    "-1234567890123456789012345678901239.5"
                ).toString({ format: "decimal" })
            ).toStrictEqual("-1234567890123456789012345678901240");
        });
        test("round up decimal digit is not nine", () => {
            expect(
                new Decimal128("1234567890123456789012345678901239.8").toString(
                    { format: "decimal" }
                )
            ).toStrictEqual("1234567890123456789012345678901240");
        });
        test("empty string not OK", () => {
            expect(() => new Decimal128("")).toThrow(SyntaxError);
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal128(" 42")).toThrow(SyntaxError);
        });
        test("many significant digits", () => {
            expect(
                new Decimal128("0.3666666666666666666666666666666667")
            ).toBeInstanceOf(Decimal128);
        });
        test("significant digits are counted, not total digits", () => {
            expect(
                new Decimal128(
                    "100000000000000000000000000000000000000000000000000"
                )
            ).toBeInstanceOf(Decimal128);
        });
        test("too many significant digits", () => {
            expect(
                () => new Decimal128("-10000000000000000000000000000000008")
            ).toThrow(RangeError);
        });
        test("significant digits are counted, not total digits", () => {
            expect(
                new Decimal128(
                    "10000000000000000000000000000000000000000000.0000000"
                )
            ).toBeInstanceOf(Decimal128);
        });
        test("ton of digits gets rounded", () => {
            expect(
                new Decimal128(
                    "0.3666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666667"
                ).toString({ format: "decimal" })
            ).toStrictEqual("0.3666666666666666666666666666666667");
        });
        test("close to one, too many digits, gets rounded to 1.000...", () => {
            expect(
                new Decimal128("0." + "9".repeat(100)).toString({
                    format: "decimal",
                })
            ).toStrictEqual("1");
        });
        test("lots of digits gets rounded to minus 1", () => {
            expect(
                new Decimal128("-0." + "9".repeat(100)).toString({
                    format: "decimal",
                })
            ).toStrictEqual("-1");
        });
        test("lots of digits gets rounded to 10", () => {
            expect(
                new Decimal128("9." + "9".repeat(100)).toString({
                    format: "decimal",
                })
            ).toStrictEqual("10");
        });
        test("rounding at the limit of significant digits", () => {
            expect(
                new Decimal128(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9"
                ).toString({ format: "decimal" })
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("rounding occurs beyond the limit of significant digits", () => {
            expect(
                new Decimal128(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS + 100) + "9"
                ).toString({ format: "decimal" })
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        test("minus zero", () => {
            let minusZero = new Decimal128("-0");
            expect(minusZero.toString({ format: "decimal" })).toStrictEqual(
                "-0"
            );
            expect(minusZero.isNegative()).toStrictEqual(true);
        });
        describe("zeros", () => {
            test("leading zeros get stripped", () => {
                expect(
                    new Decimal128("00").toString({ format: "decimal" })
                ).toStrictEqual("0");
            });
            test("leading zeros get stripped (negative)", () => {
                expect(
                    new Decimal128("-00").toString({ format: "decimal" })
                ).toStrictEqual("-0");
            });
            test("zero point zero", () => {
                expect(
                    new Decimal128("0.0").toString({ format: "decimal" })
                ).toStrictEqual("0");
            });
            test("minus zero point zero", () => {
                expect(
                    new Decimal128("-0.0").toString({ format: "decimal" })
                ).toStrictEqual("-0");
            });
            test("multiple trailing zeros", () => {
                expect(
                    new Decimal128("0.000").toString({ format: "decimal" })
                ).toStrictEqual("0");
            });
            test("multiple trailing zeros (negative)", () => {
                expect(
                    new Decimal128("-0.000").toString({ format: "decimal" })
                ).toStrictEqual("-0");
            });
        });
    });

    describe("exponential string syntax", () => {
        test("nonsense string input", () => {
            expect(() => new Decimal128("howdy")).toThrow(SyntaxError);
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal128(" 42E10")).toThrow(SyntaxError);
        });
        test("too many significant digits", () => {
            expect(
                () => new Decimal128("-10000000000000000000000000000000008E5")
            ).toThrow(RangeError);
        });
        test("exponent too big", () => {
            expect(() => new Decimal128("123E100000")).toThrow(RangeError);
        });
        test("exponent too small", () => {
            expect(() => new Decimal128("123E-100000")).toThrow(RangeError);
        });
        test("max exponent", () => {
            expect(new Decimal128("123E6111")).toBeInstanceOf(Decimal128);
            expect(() => new Decimal128("123E6112")).toThrow(RangeError);
        });
        test("min exponent", () => {
            expect(new Decimal128("123E-6176")).toBeInstanceOf(Decimal128);
            expect(() => new Decimal128("123E-6177")).toThrow(RangeError);
        });
        test("integer too big", () => {
            expect(
                () =>
                    new Decimal128(
                        "1234567890123456789012345678901234567890E10"
                    )
            ).toThrow(RangeError);
        });
    });
});

describe("NaN", () => {
    describe("does not throw", () => {
        expect(new Decimal128("NaN")).toBeInstanceOf(Decimal128);
    });
    describe("minus NaN throws ", () => {
        expect(() => new Decimal128("-NaN")).toThrow(SyntaxError);
    });
    describe("lowercase throws", () => {
        expect(() => new Decimal128("nan")).toThrow(SyntaxError);
    });
    describe("weird case throws", () => {
        expect(() => new Decimal128("-nAN")).toThrow(SyntaxError);
    });
});

describe("infinity", () => {
    describe("inf", () => {
        expect(() => new Decimal128("inf")).toThrow(SyntaxError);
    });
    describe("-inf", () => {
        expect(() => new Decimal128("-inf")).toThrow(SyntaxError);
    });
    describe("infinity", () => {
        expect(() => new Decimal128("infinity")).toThrow(SyntaxError);
    });
    describe("-infinity", () => {
        expect(() => new Decimal128("-infinity")).toThrow(SyntaxError);
    });
    describe("Infinity", () => {
        expect(new Decimal128("Infinity")).toBeInstanceOf(Decimal128);
    });
    describe("-Infinity", () => {
        expect(new Decimal128("-Infinity")).toBeInstanceOf(Decimal128);
    });
    describe("Inf", () => {
        expect(() => new Decimal128("Inf")).toThrow(SyntaxError);
    });
    describe("-Inf", () => {
        expect(() => new Decimal128("-Inf")).toThrow(SyntaxError);
    });
    describe("INFINITY", () => {
        expect(() => new Decimal128("INFINITY")).toThrow(SyntaxError);
    });
    describe("-INFINITY", () => {
        expect(() => new Decimal128("-INFINITY")).toThrow(SyntaxError);
    });
    describe("INF", () => {
        expect(() => new Decimal128("INF")).toThrow(SyntaxError);
    });
    describe("-INF", () => {
        expect(() => new Decimal128("-INF")).toThrow(SyntaxError);
    });
});

describe("General Decimal Arithmetic specification", () => {
    describe("decimal syntax", () => {
        test("0", () => {
            expect(
                new Decimal128("0").toString({ format: "decimal" })
            ).toStrictEqual("0");
        });
        test("12", () => {
            expect(
                new Decimal128("12").toString({ format: "decimal" })
            ).toStrictEqual("12");
        });
        test("-76", () => {
            expect(
                new Decimal128("-76").toString({ format: "decimal" })
            ).toStrictEqual("-76");
        });
        test("12.70", () => {
            expect(
                new Decimal128("12.70").toString({ format: "decimal" })
            ).toStrictEqual("12.7");
        });
        test("+0.003", () => {
            expect(
                new Decimal128("+0.003").toString({ format: "decimal" })
            ).toStrictEqual("0.003");
        });
        test("017.", () => {
            expect(
                new Decimal128("017.").toString({ format: "decimal" })
            ).toStrictEqual("17");
        });
        test(".5", () => {
            expect(
                new Decimal128(".5").toString({ format: "decimal" })
            ).toStrictEqual("0.5");
        });
        test("4E+9", () => {
            expect(
                new Decimal128("4E+9").toString({ format: "decimal" })
            ).toStrictEqual("4000000000");
        });
        test("Inf", () => {
            expect(() => new Decimal128("Inf")).toThrow(SyntaxError);
        });
        test("-infinity", () => {
            expect(() => new Decimal128("-infinity")).toThrow(SyntaxError);
        });
        test("NaN", () => {
            expect(
                new Decimal128("NaN").toString({ format: "decimal" })
            ).toStrictEqual("NaN");
        });
        test("NaN8275 (diagnostic information discarded)", () => {
            expect(() => new Decimal128("NaN8275")).toThrow(SyntaxError);
        });
        test("period", () => {
            expect(() => new Decimal128(".")).toThrow(SyntaxError);
        });
        test("plus period", () => {
            expect(() => new Decimal128("+.")).toThrow(SyntaxError);
        });
        test("minus period", () => {
            expect(() => new Decimal128("-.")).toThrow(SyntaxError);
        });
        test("plus", () => {
            expect(() => new Decimal128("+")).toThrow(SyntaxError);
        });
        test("minus", () => {
            expect(() => new Decimal128("-")).toThrow(SyntaxError);
        });
    });
});

describe("number arguments", () => {
    test("integer", () => {
        expect(
            new Decimal128(42).toString({ format: "decimal" })
        ).toStrictEqual("42");
    });
    test("non-integer number", () => {
        expect(
            new Decimal128(42.5).toString({ format: "decimal" })
        ).toStrictEqual("42.5");
    });
    test("NaN", () => {
        expect(
            new Decimal128(NaN).toString({ format: "decimal" })
        ).toStrictEqual("NaN");
    });
    test("minus zero", () => {
        expect(
            new Decimal128(-0).toString({ format: "decimal" })
        ).toStrictEqual("-0");
    });
    test("very large value gets approximated", () => {
        expect(
            new Decimal128(123456789012345678901234567890123456789).toString({
                format: "decimal",
            })
        ).toStrictEqual("123456789012345680000000000000000000000");
    });
});

describe("bigint", () => {
    test("simple", () => {
        expect(
            new Decimal128(42n).toString({ format: "decimal" })
        ).toStrictEqual("42");
    });
    test("too big", () => {
        expect(
            () => new Decimal128(123456789012345678901234567890123456789n)
        ).toThrow(RangeError);
    });
});
