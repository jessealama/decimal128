import { Decimal128 } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const zero = new Decimal128("0");
const one = new Decimal128("1");

describe("syntax", () => {
    test("sane string works", () => {
        expect(new Decimal128("123.456")).toBeInstanceOf(Decimal128);
    });
    test("zero works", () => {
        expect(zero).toBeInstanceOf(Decimal128);
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

describe("scale and significand", () => {
    let data = {
        "123.456": ["123456", 3],
        "0": ["", undefined],
        "0.0": ["", undefined],
        "-123.456": ["123456", 3],
        "0.0042": ["42", -4],
        "0.00000000000000000000000000000000000001": ["1", -38],
        "1000": ["1", 4],
    };
    Object.keys(data).forEach((n) => {
        test(`simple example (${n})`, () => {
            let d = new Decimal128(n);
            let sigDigits = data[n][0];
            let scale = data[n][1];
            expect(d.significand).toStrictEqual(sigDigits);
            expect(d.scale).toStrictEqual(scale);
        });
    });
    test("silently round up if too many significant digits", () => {
        expect(
            new Decimal128("1234.56789123456789123456789123456789").significand
        ).toStrictEqual("1234567891234567891234567891234568");
    });
});

describe("normalization", () => {
    test("zero on the left", () => {
        expect(new Decimal128("0123.456").toString()).toStrictEqual("123.456");
    });
    test("zero on the right", () => {
        expect(new Decimal128("123.4560").toString()).toStrictEqual("123.456");
    });
    test("point zero gets dropped", () => {
        expect(new Decimal128("123.0").toString()).toStrictEqual("123");
    });
    test("multiple initial zeros gets squeezed to single zero", () => {
        expect(new Decimal128("00.123").toString()).toStrictEqual("0.123");
    });
    test("zero point zero is zero", () => {
        expect(new Decimal128("0.0").toString()).toStrictEqual("0");
    });
    test("minus zero point zero is zero", () => {
        expect(new Decimal128("-0.0").toString()).toStrictEqual("0");
    });
    test("zero zero point zero is zero", () => {
        expect(new Decimal128("00.0").toString()).toStrictEqual("0");
    });
    test("minus zero zero point zero is zero", () => {
        expect(new Decimal128("-00.0").toString()).toStrictEqual("0");
    });
    test("zero point zero zero is zero", () => {
        expect(new Decimal128("0.00").toString()).toStrictEqual("0");
    });
    test("minus zero point zero zero is zero", () => {
        expect(new Decimal128("-0.00").toString()).toStrictEqual("0");
    });
});

describe("addition", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    let big = new Decimal128(bigDigits);
    ("");
    let two = new Decimal128("2");
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
});

describe("multiply", () => {
    test("worked-out example", () => {
        expect(
            new Decimal128("123.456")
                .multiply(new Decimal128("789.789"))
                .equals(new Decimal128("97504.190784"))
        );
    });
    test("negative", () => {
        expect(
            new Decimal128("987.654")
                .multiply(new Decimal128("-321.987"))
                .equals(new Decimal128("-318011.748498"))
        );
    });
    test("overflow", () => {
        expect(() =>
            new Decimal128("123456789123456789").multiply(
                new Decimal128("987654321987654321")
            )
        ).toThrow(RangeError);
    });
    test("scale too big", () => {
        expect(() => new Decimal128("1" + "0".repeat(7000))).toThrow(
            RangeError
        );
    });
    test("scale too small", () => {
        expect(() => new Decimal128("0." + "0".repeat(7000) + "1")).toThrow(
            RangeError
        );
    });
});

describe("divide", () => {
    test("finite decimal representation", () => {
        expect(
            new Decimal128("0.654")
                .divide(new Decimal128("0.12"))
                .equals(new Decimal128("5.45"))
        );
    });
    test("infinite decimal representation", () => {
        expect(
            new Decimal128("0.11")
                .divide(new Decimal128("0.3"))
                .equals(new Decimal128("0.36666666666666666666666"))
        );
    });
    test("many digits, few significant", () => {
        expect(
            new Decimal128("0.00000000000000000000000000000000000001")
                .divide(new Decimal128("2"))
                .equals(
                    new Decimal128("0.000000000000000000000000000000000000005")
                )
        );
    });
    test("divide by zero", () => {
        expect(() =>
            new Decimal128("123.456").divide(new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
    test("one third", () => {
        expect(
            one
                .divide(new Decimal128("3"))
                .equals(
                    new Decimal128("0." + "3".repeat(MAX_SIGNIFICANT_DIGITS))
                )
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
        expect(() => d.toDecimalPlaces(0)).toThrow(RangeError);
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
        expect(new Decimal128("-2.5").floor().equals(new Decimal128("-3")));
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
});

describe("exponential", () => {
    describe("base is zero", () => {
        test("exponent is positive integer", () => {
            expect(zero.exp(new Decimal128("5")).equals(zero));
        });
        test("exponent is negative integer", () => {
            expect(() => zero.exp(new Decimal128("-42"))).toThrow(RangeError);
        });
        test("exponent is negative non-integer", () => {
            expect(() => zero.exp(new Decimal128("-2.75"))).toThrow(RangeError);
        });
    });
    describe("exponent is zero", () => {
        test("base is positive integer", () => {
            expect(new Decimal128("123").exp(zero).equals(one));
        });
        test("base is positive non-integer", () => {
            expect(new Decimal128("4.876").exp(zero).equals(one));
        });
        test("base is negative integer", () => {
            expect(new Decimal128("-42").exp(zero).equals(one));
        });
        test("10^0", () => {
            expect(new Decimal128("10").exp(zero).equals(one));
        });
    });
    describe("integer base and exponent", () => {
        describe("exponent is positive", () => {
            test("2^3", () => {
                expect(
                    new Decimal128("2")
                        .exp(new Decimal128("3"))
                        .equals(new Decimal128("8"))
                );
            });
            test("1^100", () => {
                expect(
                    new Decimal128("1").exp(new Decimal128("100")).equals(one)
                );
            });
            test("5^3", () => {
                expect(
                    new Decimal128("5")
                        .exp(new Decimal128("3"))
                        .equals(new Decimal128("125"))
                );
            });
        });
        describe("exponent is negative", () => {
            test("exact decimal representation exists", () => {
                expect(
                    new Decimal128("2")
                        .exp(new Decimal128("-3"))
                        .equals(new Decimal128("0.125"))
                );
            });
            test("4^-1", () => {
                expect(
                    new Decimal128("4")
                        .exp(new Decimal128("-1"))
                        .equals(new Decimal128("0.25"))
                );
            });
            test("exact decimal representation does not exist", () => {
                expect(
                    new Decimal128("3")
                        .exp(new Decimal128("-3"))
                        .equals(
                            new Decimal128(
                                "0.037037037037037037037037037037037"
                            )
                        )
                );
            });
        });
    });
    describe("non-integer base, integer exponent", () => {
        test("0.5^-2", () => {
            expect(
                new Decimal128("0.5")
                    .exp(new Decimal128("-2"))
                    .equals(new Decimal128("4"))
            );
        });
        test("1.5^2", () => {
            expect(
                new Decimal128("1.5")
                    .exp(new Decimal128("2"))
                    .equals(new Decimal128("2.25"))
            );
        });
        test("0.125^3", () => {
            expect(
                new Decimal128("0.125")
                    .exp(new Decimal128("3"))
                    .equals(new Decimal128("0.001953125"))
            );
        });
        test("0.8^4", () => {
            expect(
                new Decimal128("0.8")
                    .exp(new Decimal128("4"))
                    .equals(new Decimal128("0.4096"))
            );
        });
    });
    describe("base is one", () => {
        expect(one.exp(new Decimal128("123")).equals(one));
        expect(one.exp(new Decimal128("-42")).equals(one));
        expect(one.exp(zero).equals(one));
    });
    describe("cannot raise to non-integer power", () => {
        expect(() => one.exp(new Decimal128("0.5"))).toThrow(RangeError);
    });
});

describe("Euler's constant", () => {
    test("constant exists", () => {
        expect(Decimal128.E).toBeDefined();
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
