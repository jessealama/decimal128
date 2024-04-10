import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal128("NaN");
const one = new Decimal128("1");
const zero = new Decimal128("0");
const negZero = new Decimal128("-0");
let posInf = new Decimal128("Infinity");
let negInf = new Decimal128("-Infinity");

describe("lessThan", () => {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("not true", () => {
        expect(d1.lessThan(d1)).toStrictEqual(false);
    });
    test("true", () => {
        expect(d2.lessThan(d1)).toStrictEqual(true);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        let b = new Decimal128("-987.654");
        expect(a.lessThan(b)).toStrictEqual(false);
        expect(b.lessThan(a)).toStrictEqual(true);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(a.lessThan(b)).toStrictEqual(true);
        expect(b.lessThan(a)).toStrictEqual(false);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").lessThan(new Decimal128("123.456"))
        ).toStrictEqual(true);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").lessThan(
                new Decimal128("0.4166666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").lessThan(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("more digits available", () => {
        expect(
            new Decimal128("0.037").lessThan(new Decimal128("0.037037037037"))
        ).toStrictEqual(true);
    });
    describe("examples from a presenation", () => {
        let a = new Decimal128("1.00");
        let b = new Decimal128("1.0000");
        let c = new Decimal128("1.0001");
        let d = new Decimal128("0.9999");
        test("use mathematical equality by default", () => {
            expect(b.lessThan(a)).toStrictEqual(false);
        });
        test("mathematically distinct", () => {
            expect(a.lessThan(c)).toStrictEqual(true);
        });
        test("mathematically distinct, again", () => {
            expect(b.lessThan(d)).toStrictEqual(false);
        });
        test("mathematically distinct, once more", () => {
            expect(a.lessThan(d)).toStrictEqual(false);
        });
    });
});

describe("many digits", () => {
    test("non-equality within limits", () => {
        expect(
            new Decimal128("0." + "4".repeat(33)).lessThan(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(true);
    });
    describe("NaN", () => {
        test("NaN lessThan NaN throws", () => {
            expect(() => nan.lessThan(nan)).toThrow(RangeError);
        });
        test("number lessThan NaN throws", () => {
            expect(() => one.lessThan(nan)).toThrow(RangeError);
        });
        test("NaN lessThan number throws ", () => {
            expect(() => nan.lessThan(one)).toThrow(RangeError);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.lessThan(zero)).toStrictEqual(false);
        });
        test("right hand", () => {
            expect(zero.lessThan(negZero)).toStrictEqual(false);
        });
        test("both arguments", () => {
            expect(negZero.lessThan(negZero)).toStrictEqual(false);
        });
    });
    describe("infinity", () => {
        test("positive infinity vs number", () => {
            expect(posInf.lessThan(one)).toStrictEqual(false);
        });
        test("negative infinity vs number", () => {
            expect(negInf.lessThan(one)).toStrictEqual(true);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.lessThan(posInf)).toStrictEqual(true);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.lessThan(negInf)).toStrictEqual(false);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.lessThan(posInf)).toStrictEqual(false);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.lessThan(negInf)).toStrictEqual(false);
        });
        test("compare number to positive infinity", () => {
            expect(one.lessThan(posInf)).toStrictEqual(true);
        });
        test("compare number to negative infinity", () => {
            expect(one.lessThan(negInf)).toStrictEqual(false);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.lessThan(zero)).toStrictEqual(false);
    });
    test("negative zero", () => {
        expect(negZero.lessThan(negZero)).toStrictEqual(false);
    });
    test("negative zero vs zero", () => {
        expect(negZero.lessThan(zero)).toStrictEqual(false);
    });
    test("zero vs negative zero, normalization disabled", () => {
        expect(zero.lessThan(negZero, { normalize: true })).toStrictEqual(
            false
        );
    });
});

describe("normalization", () => {
    let d1 = new Decimal128("1.2");
    let d2 = new Decimal128("1.20");
    let d3 = new Decimal128("1.200");
    test("compare normalized to normalized", () => {
        expect(d1.lessThan(d2)).toStrictEqual(false);
    });
    test("compare normalized to normalized", () => {
        expect(d2.lessThan(d3)).toStrictEqual(false);
    });
    test("compare normalized to normalized", () => {
        expect(d1.lessThan(d3)).toStrictEqual(false);
    });
    test("compare non-normal (1)", () => {
        expect(d1.lessThan(d2)).toStrictEqual(false);
    });
    test("compare two non-normal values", () => {
        expect(d2.lessThan(d3)).toStrictEqual(false);
    });
    test("compare two non-normal values", () => {
        expect(d3.lessThan(d2)).toStrictEqual(false);
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    describe("compare", () => {
        test("example one", () => {
            expect(
                new Decimal128("2.1").lessThan(new Decimal128("3"))
            ).toStrictEqual(true);
        });
        test("example two", () => {
            expect(
                new Decimal128("2.1").lessThan(new Decimal128("2.1"))
            ).toStrictEqual(false);
        });
        test("example three", () => {
            expect(
                new Decimal128("2.1").lessThan(new Decimal128("2.10"))
            ).toStrictEqual(false);
        });
        test("example four", () => {
            expect(
                new Decimal128("3").lessThan(new Decimal128("2.1"))
            ).toStrictEqual(false);
        });
        test("example five", () => {
            expect(
                new Decimal128("2.1").lessThan(new Decimal128("-3"))
            ).toStrictEqual(false);
        });
        test("example five", () => {
            expect(
                new Decimal128("-3").lessThan(new Decimal128("2.1"))
            ).toStrictEqual(true);
        });
    });
    describe("compare-total", () => {
        test("example one", () => {
            expect(
                new Decimal128("12.73").lessThan(new Decimal128("127.9"), {
                    normalize: true,
                })
            ).toStrictEqual(true);
        });
        test("example two", () => {
            expect(
                new Decimal128("-127").lessThan(new Decimal128("12"), {
                    normalize: true,
                })
            ).toStrictEqual(true);
        });
        test("example three", () => {
            expect(
                new Decimal128("12.30").lessThan(new Decimal128("12.3"))
            ).toStrictEqual(false); // would be true if we were to respect trailing zeroes
        });
        test("example four", () => {
            expect(
                new Decimal128("12.30").lessThan(new Decimal128("12.30"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example five", () => {
            expect(
                new Decimal128("12.3").lessThan(new Decimal128("12.300"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example six", () => {
            expect(() =>
                new Decimal128("12.3").lessThan(new Decimal128("NaN"))
            ).toThrow(RangeError); // wouldn't throw if we were to use total ordering
        });
    });
});
