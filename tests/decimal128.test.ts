import { Decimal128 } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const zero = new Decimal128("0");
const one = new Decimal128("1");
const minusThree = new Decimal128("-3");

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
        expect(new Decimal128("0." + "9".repeat(100)).toString()).toStrictEqual(
            "1"
        );
    });
    test("lots of digits gets rounded to minus 1", () => {
        expect(
            new Decimal128("-0." + "9".repeat(100)).toString()
        ).toStrictEqual("-1");
    });
    test("lots of digits gets rounded to 10", () => {
        expect(new Decimal128("9." + "9".repeat(100)).toString()).toStrictEqual(
            "10"
        );
    });
    test("rounding at the limit of significant digits", () => {
        expect(
            new Decimal128(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9"
            ).toString()
        ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2");
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
    test("negative significant and negative exponent works", () => {
        expect(new Decimal128("-123E-456")).toBeInstanceOf(Decimal128);
    });
    test("leading zero does not work", () => {
        expect(() => new Decimal128("0123E10")).toThrow(SyntaxError);
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
            () => new Decimal128("1234567890123456789012345678901234567890E10")
        ).toThrow(RangeError);
    });
});

describe("is-negative", () => {
    test("simple negative example", () => {
        expect(new Decimal128("-123.456").isNegative);
    });
    test("zero is not negative", () => {
        expect(zero.isNegative).toBeFalsy();
    });
    test("simple positive example", () => {
        expect(new Decimal128("123.456").isNegative).toBeFalsy();
    });
});

describe("exponent and significand", () => {
    let data: [string, string, number][] = [
        ["123.456", "123456", -3],
        ["0", "", 0],
        ["0.0", "", 0],
        ["5", "5", 0],
        ["-123.456", "123456", -3],
        ["0.0042", "42", -4],
        ["0.00000000000000000000000000000000000001", "1", -38],
        ["1000", "1", 3],
        ["0.5", "5", -1],
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

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(new Decimal128("123").isInteger());
    });
    test("looks like negative integer", () => {
        expect(new Decimal128("-456").isInteger());
    });
    test("zero is integer", () => {
        expect(zero.isInteger());
    });
    test("zero point zero is integer", () => {
        expect(new Decimal128("0.0").isInteger());
    });
    test("positive integer point zero is integer", () => {
        expect(new Decimal128("1234.0").isInteger());
    });
    test("negative integer point zero is integer", () => {
        expect(new Decimal128("-987.0").isInteger());
    });
    test("positive non-integer", () => {
        expect(new Decimal128("123.456").isInteger()).toBeFalsy();
    });
    test("negative non-integer", () => {
        expect(new Decimal128("-987.654").isInteger()).toBeFalsy();
    });
});

describe("absolute value", function () {
    test("simple positive case", () => {
        expect(new Decimal128("123.456").abs().equals(new Decimal128("123")));
    });
    test("simple negative case", () => {
        expect(new Decimal128("-123.456").abs().equals(new Decimal128("123")));
    });
});

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(new Decimal128("123.456").floor().equals(new Decimal128("123")));
        expect(new Decimal128("-2.5").floor().equals(minusThree));
    });
    test("floor works (negative)", () => {
        expect(
            new Decimal128("-123.456").floor().equals(new Decimal128("-124"))
        );
    });
    test("floor of integer is unchanged", () => {
        expect(new Decimal128("123").floor().equals(new Decimal128("123")));
    });
    test("floor of zero is unchanged", () => {
        expect(zero.floor().equals(zero));
    });
});

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(new Decimal128("123.456").ceil().equals(new Decimal128("124")));
    });
    test("ceiling works (negative)", () => {
        expect(
            new Decimal128("-123.456").ceil().equals(new Decimal128("-123"))
        );
    });
    test("ceiling of an integer is unchanged", () => {
        expect(new Decimal128("123").ceil().equals(new Decimal128("123")));
    });
});

describe("cmp", function () {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("cmp is zero", () => {
        expect(d1.cmp(d1)).toStrictEqual(0);
    });
    test("cmp is one", () => {
        expect(d1.cmp(d2)).toStrictEqual(1);
    });
    test("cmp is minus one", () => {
        expect(d2.cmp(d1)).toStrictEqual(-1);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        let b = new Decimal128("-987.654");
        expect(a.cmp(b)).toStrictEqual(1);
        expect(b.cmp(a)).toStrictEqual(-1);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(a.cmp(b)).toStrictEqual(-1);
        expect(b.cmp(a)).toStrictEqual(1);
    });
});

describe("truncate", () => {
    test("basic example", () => {
        expect(
            new Decimal128("123.45678").truncate().equals(new Decimal128("123"))
        );
    });
    test("truncate negative", () => {
        expect(
            new Decimal128("-42.99").truncate().equals(new Decimal128("-42"))
        );
    });
    test("between zero and one", () => {
        expect(new Decimal128("0.00765").truncate().equals(zero));
    });
});

describe("equals", () => {
    test("simple case", () => {
        expect(new Decimal128("123.456").equals(new Decimal128("123.456")));
    });
    test("different number of digits", () => {
        expect(
            new Decimal128("123.456").equals(new Decimal128("123.4561"))
        ).toBeFalsy();
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").equals(new Decimal128("123.456"))
        ).toBeFalsy();
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").equals(
                new Decimal128("0.4166666666666666666666666666666666")
            )
        ).toBeFalsy();
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").equals(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        );
    });
});

describe("equality", () => {
    test("equality works", () => {
        expect(
            new Decimal128("123").equals(new Decimal128("123"))
        ).toBeTruthy();
    });
    test("equality works with different number of digits", () => {
        expect(
            new Decimal128("123").equals(new Decimal128("123.1"))
        ).toBeFalsy();
    });
    test("non-example", () => {
        expect(
            new Decimal128("0.037").equals(new Decimal128("0.037037037037"))
        ).toBeFalsy();
    });
    describe("many digits", () => {
        test("integer too large", () => {
            expect(
                () =>
                    new Decimal128(
                        "100000000000000000000000000000000000000000000000001"
                    )
            ).toThrow(RangeError);
        });
        test("non-integers get rounded", () => {
            expect(
                new Decimal128("0." + "4".repeat(50)).equals(
                    new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            );
        });
        test("non-equality within limits", () => {
            expect(
                new Decimal128("0." + "4".repeat(33)).equals(
                    new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            ).toBeFalsy();
        });
        test("non-integer works out to be integer", () => {
            expect(
                new Decimal128(
                    "1.00000000000000000000000000000000000000000000000001"
                ).equals(one)
            );
        });
    });
});
