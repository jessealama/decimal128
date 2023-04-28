import {Decimal128} from "../src/decimal128";

describe("syntax tests", () => {
    test("sane string works", () => {
        expect(new Decimal128("123.456")).toBeInstanceOf(Decimal128);
    });
    test("zero works", () => {
        expect(new Decimal128("0")).toBeInstanceOf(Decimal128);
    });
    test("negative works", () => {
        expect(new Decimal128("-123.456")).toBeInstanceOf(Decimal128);
    });
    test("integer works (decimal point unnecessary)", () => {
        expect(new Decimal128("123")).toBeInstanceOf(Decimal128);
    });
    test("too many digits", () => {
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
    test("significant digits are counted, not total digits (2)", () => {
        expect(
            () =>
                new Decimal128(
                    "100000000000000000000000000000000000000000000000001"
                )
        ).toThrow(RangeError);
    });
    test("significant digits are counted, not total digits (3)", () => {
        expect(
            () =>
                new Decimal128(
                    "1.00000000000000000000000000000000000000000000000001"
                )
        ).toThrow(RangeError);
    });
    test("significant digits are counted, not total digits (4)", () => {
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
        expect(new Decimal128("0").isNegative).toBeFalsy();
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
});

describe("normalization tests", () => {
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

// Taken from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomArray(len: number, min: number, max: number) {
    let values: number[] = [];
    for (let i = 0; i < len; i++) {
        values = values.concat([getRandomInt(min, max)]);
    }
    return values;
}

function digitArrayToString(digits: number[]): string {
    return digits.reduce((a, b) => a + b, "");
}

const maxDigits = 34;

describe("maximum digits", () => {
    for (let i = 0; i + 1 < maxDigits; i++) {
        let moreDigits = getRandomArray(i - 2, 0, 10);
        let digits = [getRandomInt(1, 10)]
            .concat(moreDigits)
            .concat([getRandomInt(1, 10)]);
        let digitString = digitArrayToString(digits);
        test(`testing ${digitString.length}-digit string (positive)`, () => {
            expect(new Decimal128(digitString)).toBeInstanceOf(Decimal128);
        });
        test(`testing ${digitString.length}-digit string (negative)`, () => {
            expect(new Decimal128("-" + digitString)).toBeInstanceOf(
                Decimal128
            );
        });
    }
    let hugeDigits = digitArrayToString(getRandomArray(maxDigits + 1, 1, 10));
    test(`too many digits (${maxDigits + 1}, positive)`, () => {
        expect(() => new Decimal128(hugeDigits)).toThrow(RangeError);
    });
    test(`too many digits (${maxDigits + 1}, negative)`, () => {
        expect(() => new Decimal128("-" + hugeDigits)).toThrow(RangeError);
    });
});

describe("addition", () => {
    let bigDigits = "9999999999999999999999999999999999";
    let big = new Decimal128(bigDigits);
    let zero = new Decimal128("0");
    let one = new Decimal128("1");
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
    let bigDigits = "9999999999999999999999999999999999";
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
                .equals(new Decimal128("9999999999999999999999999999999990"))
        );
    });
    test("overflow", () => {
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
});

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(new Decimal128("123").isInteger());
    });
    test("looks like negative integer", () => {
        expect(new Decimal128("-456").isInteger());
    });
    test("zero is integer", () => {
        expect(new Decimal128("0").isInteger());
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
        expect(d.toDecimalPlaces(1).equals(new Decimal128("1")));
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
        expect(new Decimal128("0").floor().equals(new Decimal128("0")));
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
        expect(
            new Decimal128("0.00765").truncate().equals(new Decimal128("0"))
        );
    });
});

describe('equals', () => {
    test('simple case', () => {
        expect(new Decimal128("123.456").equals(new Decimal128("123.456")));
    });
    test('different number of digits', () => {
        expect(new Decimal128("123.456").equals(new Decimal128("123.4561"))).toBeFalsy();
    });
    test('negative and positive are different', () => {
       expect(new Decimal128("-123.456").equals(new Decimal128("123.456"))).toBeFalsy();
    });
});

describe('exponential', () => {
    let z = new Decimal128("0");
    let o = new Decimal128("1");
    describe('base is zero', () => {
        test('exponent is positive integer', () => {
            expect(z.exp(new Decimal128("5")).equals(z));
        });
        test('exponent is positive non-integer', () => {
            expect(z.exp(new Decimal128("4.876")).equals(z));
        });
        test('exponent is negative integer', () => {
            expect(
                () => z.exp(new Decimal128("-42"))
            ).toThrow(RangeError);
        });
        test('exponent is negative non-integer', () => {
            expect(
                () => z.exp(new Decimal128("-2.75"))
            ).toThrow(RangeError);
        });
    });
    describe('exponent is zero', () => {
        test('base is positive integer', () => {
            expect(new Decimal128("123").exp(z).equals(o));
        });
        test('base is positive non-integer', () => {
            expect(new Decimal128("4.876").exp(z).equals(o));
        });
        test('base is negative integer', () => {
            expect(new Decimal128("-42").exp(z).equals(o));
        });
    });
    describe('integer base and exponent', () => {
        expect(new Decimal128("2").exp(new Decimal128("3")).equals(new Decimal128("8")));
        expect(new Decimal128("2").exp(new Decimal128("-3")).equals(new Decimal128("0.125")));
        expect(new Decimal128("-2").exp(new Decimal128("3")).equals(new Decimal128("-8")));
    });
    describe('worked out examples (exact)', () => {
        test('1', () => {
            expect(new Decimal128("1.234").exp(new Decimal128("4.567")).equals(new Decimal128("2.6123799045")));
        });
    });
    describe('base is one', () => {
        expect(o.exp(new Decimal128("123")).equals(o));
        expect(o.exp(new Decimal128("-42")).equals(o));
        expect(o.exp(new Decimal128("0")).equals(o));
        expect(o.exp(new Decimal128("0.5")).equals(o));
    });

    // give me five test cases for the log function
    describe('log', () => {
        test('log of zero', () => {
            expect(() => z.log()).toThrow(RangeError);
        });
        test('log of negative', () => {
            expect(() => new Decimal128("-42").log()).toThrow(RangeError);
        });
        test('log of positive integer', () => {
            expect(new Decimal128("123").log().equals(new Decimal128("4.8121843554")));
        });
        test('log of positive non-integer', () => {
            expect(new Decimal128("4.876").log().equals(new Decimal128("1.5843252116")));
        });
    });
});

describe("Euler's constant", () => {
    test('constant exists', () => {
       expect(Decimal128.E).toBeDefined();
    });
});
