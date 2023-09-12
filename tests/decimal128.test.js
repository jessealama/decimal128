import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("constructor", () => {
    describe("digit string syntax", () => {
        test("sane string works", () => {
            expect(new Decimal128("123.456")).toBeInstanceOf(Decimal128);
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
        test("significant digits are counted, not total digits (1)", () => {
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
        test("significant digits are counted, not total digits (2)", () => {
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
        test("lots of digits gets rounded to 1", () => {
            expect(
                new Decimal128("0." + "9".repeat(100)).toString()
            ).toStrictEqual("1");
        });
        test("lots of digits gets rounded to minus 1", () => {
            expect(
                new Decimal128("-0." + "9".repeat(100)).toString()
            ).toStrictEqual("-1");
        });
        test("lots of digits gets rounded to 10", () => {
            expect(
                new Decimal128("9." + "9".repeat(100)).toString()
            ).toStrictEqual("10");
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
    });

    describe("exponential string syntax", () => {
        test("sane string works (big E)", () => {
            expect(new Decimal128("123E456")).toBeInstanceOf(Decimal128);
        });
        test("sane string works (little E)", () => {
            expect(new Decimal128("123e456")).toBeInstanceOf(Decimal128);
        });
        test("negative works", () => {
            expect(new Decimal128("-123E456")).toBeInstanceOf(Decimal128);
        });
        test("negative exponent works", () => {
            expect(new Decimal128("123E-456")).toBeInstanceOf(Decimal128);
        });
        test("positive exponent works", () => {
            expect(new Decimal128("123E+456")).toBeInstanceOf(Decimal128);
        });
        test("negative significant and negative exponent works", () => {
            expect(new Decimal128("-123E-456")).toBeInstanceOf(Decimal128);
        });
        test("leading zero does not work", () => {
            expect(() => new Decimal128("0123E10")).toThrow(SyntaxError);
        });
        test("nonsense string input", () => {
            expect(() => new Decimal128("howdy")).toThrow(SyntaxError);
        });
        test("leading zero in exponent does not work", () => {
            expect(() => new Decimal128("123E05")).toThrow(SyntaxError);
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal128(" 42E10")).toThrow(SyntaxError);
        });
        test("many significant digits", () => {
            expect(
                new Decimal128("3666666666666666666666666666666667E10")
            ).toBeInstanceOf(Decimal128);
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
    describe("bigint as argument", () => {
        test("positive bigint", () => {
            expect(new Decimal128(123n).toString()).toStrictEqual("123");
        });
        test("negative bigint", () => {
            expect(new Decimal128(-123n).toString()).toStrictEqual("-123");
        });
    });
    describe("number as argument", () => {
        test("positive number", () => {
            expect(new Decimal128(123).toString()).toStrictEqual("123");
        });
        test("negative number", () => {
            expect(new Decimal128(-123).toString()).toStrictEqual("-123");
        });
        test("integer too large (unsafe)", () => {
            expect(
                () => new Decimal128(1234567890123456789012345678901234567890)
            ).toThrow(RangeError);
        });
        test("non-integer number", () => {
            expect(() => new Decimal128(123.456)).toThrow(TypeError);
        });
    });
});

describe("exponent and significand", () => {
    let data = [
        ["123.456", "123456", -3],
        ["0", "", 0],
        ["0.0", "", 0],
        ["5", "5", 0],
        ["-123.456", "123456", -3],
        ["0.0042", "42", -4],
        ["0.00000000000000000000000000000000000001", "1", -38],
        ["1000", "1", 3],
        ["-1000", "1", 3],
        ["-0.00001", "1", -5],
        ["0.5", "5", -1],
        ["-10", "1", 1],
        ["10", "1", 1],
        ["0.000001", "1", -6],
        ["0.0000012", "12", -7],
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
    test("non-integer works out to be integer", () => {
        expect(
            new Decimal128(
                "1.00000000000000000000000000000000000000000000000001"
            ).toString()
        ).toStrictEqual("1");
    });
});

describe("normalization", () => {
    let tests = [
        ["0123.456", "123.456"],
        ["123.4560", "123.456"],
        ["123.0", "123"],
        ["00.123", "0.123"],
        ["0.0", "0"],
        ["-0.0", "0"],
        ["00.0", "0"],
        ["-00.0", "0"],
        ["0.00", "0"],
        ["-0.00", "0"],
    ];
    for (let [a, b] of tests) {
        test(`${a} is actually ${b}`, () => {
            expect(new Decimal128(a).toString()).toStrictEqual(b);
        });
    }
});
