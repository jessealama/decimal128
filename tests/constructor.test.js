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
        test("normalization can be disabled", () => {
            expect(
                new Decimal128("1.20", { normalize: false }).toString()
            ).toStrictEqual("1.20");
        });
        test("no normalization (exponential notation) (positive exponent)", () => {
            let d = new Decimal128("1.20E1");
            expect(d.significand).toStrictEqual("120");
            expect(d.exponent).toStrictEqual(-1);
        });
        test("no normalization (exponential notation) (negative exponent)", () => {
            let d = new Decimal128("1.20E-5");
            expect(d.significand).toStrictEqual("120");
            expect(d.exponent).toStrictEqual(-7);
        });
        test("no normalization (exponential notation) (negative)", () => {
            let d = new Decimal128("-42.79E42");
            expect(d.significand).toStrictEqual("4279");
            expect(d.exponent).toStrictEqual(40);
            expect(d.isNegative).toStrictEqual(true);
        });
        test("string with underscores in integer part", () => {
            expect(new Decimal128("123_456.789").toString()).toStrictEqual(
                "123456.789"
            );
        });
        test("multiple underscores in integer part", () => {
            expect(() => new Decimal128("123__456.789")).toThrow(SyntaxError);
        });
        test("multiple underscores in decimal part", () => {
            expect(() => new Decimal128("123.789__456")).toThrow(SyntaxError);
        });
        test("leading underscore", () => {
            expect(() => new Decimal128("_123")).toThrow(SyntaxError);
        });
        test("trailing underscore", () => {
            expect(() => new Decimal128("123_")).toThrow(SyntaxError);
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
                new Decimal128(
                    "1234567890123456789012345678901234.5"
                ).toString()
            ).toStrictEqual("1234567890123456789012345678901234");
        });
        test("five as last digit past limit: tie to even round up", () => {
            expect(
                new Decimal128(
                    "1234567890123456789012345678901235.5"
                ).toString()
            ).toStrictEqual("1234567890123456789012345678901236");
        });
        test("five as last digit past limit: tie to even round up, penultimate digit is 9", () => {
            expect(
                new Decimal128(
                    "1234567890123456789012345678901239.5"
                ).toString()
            ).toStrictEqual("1234567890123456789012345678901240");
        });
        test("five as last digit past limit: tie to even round up, penultimate digit is 9 (negative)", () => {
            expect(
                new Decimal128(
                    "-1234567890123456789012345678901239.5"
                ).toString()
            ).toStrictEqual("-1234567890123456789012345678901240");
        });
        test("round up decimal digit is not nine", () => {
            expect(
                new Decimal128(
                    "1234567890123456789012345678901239.8"
                ).toString()
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
        test("decimal with very fine precision, small significand", () => {
            let s = "0.00000000000000000000000000000000000001";
            let val = new Decimal128(s);
            expect(val.significand).toStrictEqual("1");
            expect(val.exponent).toStrictEqual(-38);
            expect(val.toString()).toStrictEqual(s);
        });
        test("decimal number with trailing zero", () => {
            let val = new Decimal128("0.67890");
            expect(val.significand).toStrictEqual("67890");
            expect(val.exponent).toStrictEqual(-5);
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
                ).toString()
            ).toStrictEqual("0.3666666666666666666666666666666667");
        });
        test("close to one, too many digits, gets rounded to 1.000...", () => {
            expect(
                new Decimal128("0." + "9".repeat(100)).toString()
            ).toStrictEqual("1.000000000000000000000000000000000");
        });
        test("lots of digits gets rounded to minus 1", () => {
            expect(
                new Decimal128("-0." + "9".repeat(100)).toString()
            ).toStrictEqual("-1.000000000000000000000000000000000");
        });
        test("lots of digits gets rounded to 10", () => {
            expect(
                new Decimal128("9." + "9".repeat(100)).toString()
            ).toStrictEqual("10.00000000000000000000000000000000");
        });
        test("rounding at the limit of significant digits", () => {
            expect(
                new Decimal128(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9"
                ).toString()
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("rounding occurs beyond the limit of significant digits", () => {
            expect(
                new Decimal128(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS + 100) + "9"
                ).toString()
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        test("minus zero", () => {
            let minusZero = new Decimal128("-0");
            expect(minusZero.toString()).toStrictEqual("-0");
            expect(minusZero.isNegative).toStrictEqual(true);
        });
        describe("zeros", () => {
            test("leading zeros get stripped", () => {
                expect(new Decimal128("00").toString()).toStrictEqual("0");
            });
            test("leading zeros get stripped (negative)", () => {
                expect(new Decimal128("-00").toString()).toStrictEqual("-0");
            });
            test("zero point zero", () => {
                expect(new Decimal128("0.0").toString()).toStrictEqual("0.0");
            });
            test("minus zero point zero", () => {
                expect(new Decimal128("-0.0").toString()).toStrictEqual("-0.0");
            });
            test("multiple trailing zeros", () => {
                expect(new Decimal128("0.000").toString()).toStrictEqual(
                    "0.000"
                );
            });
            test("multiple trailing zeros (negative)", () => {
                expect(new Decimal128("-0.000").toString()).toStrictEqual(
                    "-0.000"
                );
            });
        });
    });

    describe("exponential string syntax", () => {
        test("sane string works (big E)", () => {
            let d = new Decimal128("123E456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(456);
            expect(d.isNegative).toStrictEqual(false);
        });
        test("sane string works (little E)", () => {
            let d = new Decimal128("123e456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(456);
            expect(d.isNegative).toStrictEqual(false);
        });
        test("negative works", () => {
            let d = new Decimal128("-123E456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(456);
            expect(d.isNegative).toStrictEqual(true);
        });
        test("negative exponent works", () => {
            let d = new Decimal128("123E-456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(-456);
            expect(d.isNegative).toStrictEqual(false);
        });
        test("positive exponent works", () => {
            let d = new Decimal128("123E+456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(456);
            expect(d.isNegative).toStrictEqual(false);
        });
        test("negative significant and negative exponent works", () => {
            let d = new Decimal128("-123E-456");
            expect(d.significand).toStrictEqual("123");
            expect(d.exponent).toStrictEqual(-456);
            expect(d.isNegative).toStrictEqual(true);
        });
        describe("powers of ten", () => {
            test("two", () => {
                let d = new Decimal128("1E2");
                expect(d.significand).toStrictEqual("1");
                expect(d.exponent).toStrictEqual(2);
                expect(d.isNegative).toStrictEqual(false);
            });
            test("four", () => {
                let d = new Decimal128("1E4");
                expect(d.significand).toStrictEqual("1");
                expect(d.exponent).toStrictEqual(4);
                expect(d.isNegative).toStrictEqual(false);
            });
            test("one minus one", () => {
                let d = new Decimal128("1E-1");
                expect(d.significand).toStrictEqual("1");
                expect(d.exponent).toStrictEqual(-1);
                expect(d.isNegative).toStrictEqual(false);
            });
            test("minus one minus one", () => {
                let d = new Decimal128("-1E-1");
                expect(d.significand).toStrictEqual("1");
                expect(d.exponent).toStrictEqual(-1);
                expect(d.isNegative).toStrictEqual(true);
            });
            test("minus one one", () => {
                let d = new Decimal128("-1E1");
                expect(d.significand).toStrictEqual("1");
                expect(d.exponent).toStrictEqual(1);
                expect(d.isNegative).toStrictEqual(true);
            });
        });
        test("nonsense string input", () => {
            expect(() => new Decimal128("howdy")).toThrow(SyntaxError);
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal128(" 42E10")).toThrow(SyntaxError);
        });
        test("many significant digits", () => {
            let d = new Decimal128("3666666666666666666666666666666667E10");
            expect(d.significand).toStrictEqual(
                "3666666666666666666666666666666667"
            );
            expect(d.exponent).toStrictEqual(10);
            expect(d.isNegative).toStrictEqual(false);
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
            expect(new Decimal128("123E6144")).toBeInstanceOf(Decimal128);
            expect(() => new Decimal128("123E6145")).toThrow(RangeError);
        });
        test("min exponent", () => {
            expect(new Decimal128("123E-6143")).toBeInstanceOf(Decimal128);
            expect(() => new Decimal128("123E-6144")).toThrow(RangeError);
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

describe("exponent and significand", () => {
    let data = [
        // ["123.456", "123456", -3],
        // ["0", "0", 0],
        // ["-0", "0", 0],
        // ["0.0", "0", -1],
        // ["5", "5", 0],
        // ["1.20", "120", -2],
        // ["-123.456", "123456", -3],
        // ["0.0042", "42", -4],
        // ["0.00000000000000000000000000000000000001", "1", -38],
        ["1000", "1", 3],
        // ["-1000", "1", 3],
        // ["-0.00001", "1", -5],
        // ["0.5", "5", -1],
        // ["-10", "1", 1],
        // ["10", "1", 1],
        // ["0.000001", "1", -6],
        // ["0.0000012", "12", -7],
    ];
    for (const [n, sigDigits, exponent] of data) {
        test(`simple example (${n})`, () => {
            let d = new Decimal128(n);
            expect(d.significand).toStrictEqual(sigDigits);
            expect(d.exponent).toStrictEqual(exponent);
        });
    }
    test("silently round up if too many significant digits", () => {
        expect(
            new Decimal128("1234.56789123456789123456789123456789").toString()
        ).toStrictEqual("1234.567891234567891234567891234568");
    });
    test("exponent too big", () => {
        expect(() => new Decimal128("1" + "0".repeat(7000))).toThrow(
            RangeError
        );
    });
    test("exponent too small", () => {
        expect(() => new Decimal128("0." + "0".repeat(7000) + "1")).toThrow(
            RangeError
        );
    });
});

describe("NaN", () => {
    describe("does not throw", () => {
        expect(new Decimal128("NaN")).toBeInstanceOf(Decimal128);
    });
    describe("minus NaN", () => {
        expect(new Decimal128("-NaN")).toBeInstanceOf(Decimal128);
    });
    describe("lowercase", () => {
        expect(new Decimal128("nan")).toBeInstanceOf(Decimal128);
    });
    describe("minus lowercase", () => {
        expect(new Decimal128("-nan")).toBeInstanceOf(Decimal128);
    });
    describe("weird case", () => {
        expect(new Decimal128("-nAN")).toBeInstanceOf(Decimal128);
    });
});

describe("infinity", () => {
    describe("inf", () => {
        expect(new Decimal128("inf")).toBeInstanceOf(Decimal128);
    });
    describe("-inf", () => {
        expect(new Decimal128("-inf")).toBeInstanceOf(Decimal128);
    });
    describe("infinity", () => {
        expect(new Decimal128("infinity")).toBeInstanceOf(Decimal128);
    });
    describe("-infinity", () => {
        expect(new Decimal128("-infinity")).toBeInstanceOf(Decimal128);
    });
    describe("Infinity", () => {
        expect(new Decimal128("Infinity")).toBeInstanceOf(Decimal128);
    });
    describe("-Infinity", () => {
        expect(new Decimal128("-Infinity")).toBeInstanceOf(Decimal128);
    });
    describe("Inf", () => {
        expect(new Decimal128("Inf")).toBeInstanceOf(Decimal128);
    });
    describe("-Inf", () => {
        expect(new Decimal128("-Inf")).toBeInstanceOf(Decimal128);
    });
    describe("INFINITY", () => {
        expect(new Decimal128("INFINITY")).toBeInstanceOf(Decimal128);
    });
    describe("-INFINITY", () => {
        expect(new Decimal128("-INFINITY")).toBeInstanceOf(Decimal128);
    });
    describe("INF", () => {
        expect(new Decimal128("INF")).toBeInstanceOf(Decimal128);
    });
    describe("-INF", () => {
        expect(new Decimal128("-INF")).toBeInstanceOf(Decimal128);
    });
});

describe("rounding options", () => {
    describe("weird options", () => {
        test("unknown options passed in does not throw", () => {
            expect(
                new Decimal128("0.1", { foo: "bar" }).toString()
            ).toStrictEqual("0.1");
        });
        test("unknown rounding mode works out to default", () => {
            expect(
                new Decimal128("0.5", { roundingMode: "jazzy" }).toString()
            ).toStrictEqual("0.5");
        });
        test("unknown rounding mode throws on large input", () => {
            expect(
                new Decimal128("0." + "9".repeat(10000), {
                    roundingMode: "cool",
                }).toString()
            ).toStrictEqual("1.000000000000000000000000000000000");
        });
    });
    describe("negative value, final decimal digit is five, penultimate digit is less than nine", () => {
        let val = "-1234567890123456789012345678901234.5";
        let answers = {
            ceil: "-1234567890123456789012345678901234",
            floor: "-1234567890123456789012345678901235",
            expand: "-1234567890123456789012345678901235",
            trunc: "-1234567890123456789012345678901234",
            halfEven: "-1234567890123456789012345678901234",
            halfExpand: "-1234567890123456789012345678901235",
            halfCeil: "-1234567890123456789012345678901234",
            halfFloor: "-1234567890123456789012345678901235",
            halfTrunc: "-1234567890123456789012345678901234",
        };
        for (const [mode, expected] of Object.entries(answers)) {
            test(`constructor with rounding mode "${mode}"`, () => {
                expect(
                    new Decimal128(val, { roundingMode: mode }).toString()
                ).toStrictEqual(expected);
            });
        }
    });
    describe("negative value, final decimal digit is five, penultimate digit is nine", () => {
        let roundNineVal = "-1234567890123456789012345678901239.5";
        let roundUpAnswers = {
            ceil: "-1234567890123456789012345678901239",
            floor: "-1234567890123456789012345678901240",
            expand: "-1234567890123456789012345678901240",
            trunc: "-1234567890123456789012345678901239",
            halfEven: "-1234567890123456789012345678901240",
            halfExpand: "-1234567890123456789012345678901240",
            halfCeil: "-1234567890123456789012345678901239",
            halfFloor: "-1234567890123456789012345678901240",
            halfTrunc: "-1234567890123456789012345678901239",
        };
        for (const [mode, expected] of Object.entries(roundUpAnswers)) {
            test(`constructor with rounding mode "${mode}"`, () => {
                expect(
                    new Decimal128(roundNineVal, {
                        roundingMode: mode,
                    }).toString()
                ).toStrictEqual(expected);
            });
        }
    });
});
