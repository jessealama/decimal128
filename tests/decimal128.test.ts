import { Decimal128 } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const zero = new Decimal128("0");
const one = new Decimal128("1");
const two = new Decimal128("2");
const three = new Decimal128("3");
const minusThree = new Decimal128("-3");
const four = new Decimal128("4");
const ten = new Decimal128("10");

describe("syntax", () => {
    test("sane string works", () => {
        expect(new Decimal128("123.456")).toBeInstanceOf(Decimal128);
    });
    test("string with underscores in integer part", () => {
        expect(new Decimal128("123_456.789").toString()).toStrictEqual("123456.789");
    });
    test("multiple underscores in integer part", () => {
       expect(
           () => new Decimal128("123__456.789")
       ).toThrow(SyntaxError);
    });
    test("multiple underscores in decimal part", () => {
        expect(
            () => new Decimal128("123.789__456")
        ).toThrow(SyntaxError);
    });
    test("leading underscore", () => {
        expect(
            () => new Decimal128("_123")
        ).toThrow(SyntaxError);
    });
    test("trailing underscore", () => {
        expect(
            () => new Decimal128("123_")
        ).toThrow(SyntaxError);
    });
    test("string with multiple underscores in integer part", () => {
        expect(new Decimal128("123_456_789.123").toString()).toStrictEqual("123456789.123");
    });
    test("string with underscore in decimal part", () => {
        expect(new Decimal128("123.456_789").toString()).toStrictEqual("123.456789");
    });
    test("string with underscores in both integer and decimal part", () => {
        expect(new Decimal128("123_456.789_123").toString()).toStrictEqual("123456.789123");
    });
    test("negative works", () => {
        expect(new Decimal128("-123.456")).toBeInstanceOf(Decimal128);
    });
    test("integer works (decimal point unnecessary)", () => {
        expect(new Decimal128("123")).toBeInstanceOf(Decimal128);
    });
    test("more significant digits than we can store is OK (rounding)", () => {
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
    let data = {
        "123.456": ["123456", -3],
        "0": ["", 0],
        "0.0": ["", 0],
        "5": ["5", 0],
        "-123.456": ["123456", -3],
        "0.0042": ["42", -4],
        "0.00000000000000000000000000000000000001": ["1", -38],
        "1000": ["1", 3],
        "0.5": ["5", -1],
        "0.000001": ["1", -6],
        "0.0000012": ["12", -7],
    };
    Object.keys(data).forEach((n) => {
        test(`simple example (${n})`, () => {
            let d = new Decimal128(n);
            let sigDigits = data[n][0];
            let exponent = data[n][1];
            expect(d.significand).toStrictEqual(sigDigits);
            expect(d.exponent).toStrictEqual(exponent);
        });
    });
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

describe("addition" + "", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    let big = new Decimal128(bigDigits);
    let minusOne = new Decimal128("-1");
    test("big is at the limit (cannot add more digits)", () => {
        expect(() => new Decimal128("9" + bigDigits)).toThrow(RangeError);
    });
    test("one plus one equals two", () => {
        expect(one.add(one).equals(two));
    });
    test("one plus minus one equals zero", () => {
        expect(one.add(minusOne).equals(zero));
        expect(minusOne.add(one).equals(zero));
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = new Decimal128("0.1");
        let b = new Decimal128("0.2");
        let c = new Decimal128("0.3");
        expect(a.add(b).equals(c));
        expect(b.add(a).equals(c));
    });
    test("big plus zero is OK", () => {
        expect(big.equals(big.add(zero)));
    });
    test("zero plus big is OK", () => {
        expect(big.equals(zero.add(big)));
    });
    test("big plus one is OK", () => {
        expect(big.add(one).equals(one.add(big)));
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => two.add(big)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => big.add(two)).toThrow(RangeError);
    });
    test("zero arguments", () => {
        expect(one.add().equals(one));
    });
    test("four arguments", () => {
        expect(one.add(two, three, four).equals(ten));
    });
});

describe("subtraction", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    test("subtract decimal part", () => {
        expect(
            new Decimal128("123.456")
                .subtract(new Decimal128("0.456"))
                .equals(new Decimal128("123"))
        );
    });
    test("minus negative number", () => {
        expect(
            new Decimal128("0.1")
                .subtract(new Decimal128("-0.2"))
                .equals(new Decimal128("0.3"))
        );
    });
    test("close to range limit", () => {
        expect(
            new Decimal128(bigDigits)
                .subtract(new Decimal128("9"))
                .equals(new Decimal128("9".repeat(MAX_SIGNIFICANT_DIGITS - 1)))
        );
    });
    test("integer overflow", () => {
        expect(() =>
            new Decimal128("-" + bigDigits).subtract(new Decimal128("9"))
        ).toThrow(RangeError);
    });
    test("zero arguments", () => {
        expect(one.subtract().equals(one));
    });
    test("four arguments", () => {
        expect(ten.subtract(two, three, four).equals(one));
    });
});

describe("multiplication", () => {
    let examples = [
        ["123.456", "789.789", "97504.190784"],
        ["2", "3", "6"],
        ["4", "0.5", "2"],
        ["10", "100", "1000"],
        ["0.1", "0.2", "0.02"],
        ["0.25", "1.5", "0.375"],
        ["0.12345", "0.67890", "0.083810205"],
        ["0.123456789", "0.987654321", "0.121932631112635269"],
        ["100000.123", "99999.321", "9999944399.916483"],
        [
            "123456.123456789",
            "987654.987654321",
            "121932056088.565269013112635269",
        ],
    ];
    for (let [a, b, c] of examples)
        test(`${a} * ${b} = ${c}`, () => {
            expect(
                new Decimal128(a).multiply(new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    test("negative second argument", () => {
        expect(
            new Decimal128("987.654")
                .multiply(new Decimal128("-321.987"))
                .toString()
        ).toStrictEqual("-318011.748498");
    });
    test("negative first argument", () => {
        expect(
            new Decimal128("-987.654")
                .multiply(new Decimal128("321.987"))
                .toString()
        ).toStrictEqual("-318011.748498");
    });
    test("both arguments negative", () => {
        expect(
            new Decimal128("-987.654")
                .multiply(new Decimal128("-321.987"))
                .toString()
        ).toStrictEqual("318011.748498");
    });
    test("integer overflow", () => {
        expect(() =>
            new Decimal128("123456789123456789").multiply(
                new Decimal128("987654321987654321")
            )
        ).toThrow(RangeError);
    });
    test("decimal overflow", () => {
        expect(() =>
            new Decimal128("123456789.987654321").multiply(
                new Decimal128("987654321.123456789")
            )
        ).toThrow(RangeError);
    });
    test("zero arguments", () => {
        expect(one.multiply().equals(one));
    });
    test("four arguments", () => {
        expect(ten.multiply(two, three, four).equals(new Decimal128("240")));
    });
});

describe("division", () => {
    let tests = {
        simple: ["4.1", "1.25", "3.28"],
        "finite decimal representation": ["0.654", "0.12", "5.45"],
        "infinite decimal representation": [
            "0.11",
            "0.3",
            "0.3666666666666666666666666666666667",
        ],
        "many digits, few significant": [
            "0.00000000000000000000000000000000000001",
            "2",
            "0.000000000000000000000000000000000000005",
        ],
        "one third": ["1", "3", "0.3333333333333333333333333333333333"],
        "one tenth": ["1", "10", "0.1"],
    };
    for (let [name, [a, b, c]] of Object.entries(tests)) {
        test(name, () => {
            expect(
                new Decimal128(a).divide(new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    }
    test("divide by zero", () => {
        expect(() =>
            new Decimal128("123.456").divide(new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
    test("zero arguments", () => {
        expect(one.divide().equals(one));
    });
    test("four arguments", () => {
        expect(ten.divide(two, three, four).toString()).toStrictEqual(
            "0.4166666666666666666666666666666667"
        );
    });
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

describe("to decimal places", function () {
    let d = new Decimal128("123.456");
    test("more digits than available means no change", () => {
        expect(d.toDecimalPlaces(7).equals(d));
    });
    test("same number of digits as available means no change", () => {
        expect(d.toDecimalPlaces(6).equals(d));
    });
    test("round if number has more digits than requested (1)", () => {
        expect(d.toDecimalPlaces(5).equals(new Decimal128("123.46")));
    });
    test("round if number has more digits than requested (2)", () => {
        expect(d.toDecimalPlaces(4).equals(new Decimal128("123.5")));
    });
    test("round if number has more digits than requested (3)", () => {
        expect(d.toDecimalPlaces(3).equals(new Decimal128("123")));
    });
    test("round if number has more digits than requested (4)", () => {
        expect(d.toDecimalPlaces(2).equals(new Decimal128("12")));
    });
    test("round if number has more digits than requested (5)", () => {
        expect(d.toDecimalPlaces(1).equals(one));
    });
    test("zero decimal places", () => {
        expect(d.toDecimalPlaces(0).equals(new Decimal128("123")));
    });
    test("negative number of decimal places", () => {
        expect(() => d.toDecimalPlaces(-1)).toThrow(RangeError);
    });
    test("non-integer number of decimal places", () => {
        expect(() => d.toDecimalPlaces(1.5)).toThrow(TypeError);
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
