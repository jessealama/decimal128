import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal128("NaN");
const zero = new Decimal128("0");
const negZero = new Decimal128("-0");
const one = new Decimal128("1");

describe("equals", () => {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("simple example", () => {
        expect(d1.cmp(d1)).toStrictEqual(0);
    });
    test("non-example", () => {
        expect(d1.cmp(d2)).toStrictEqual(1);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        expect(a.cmp(a)).toStrictEqual(0);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(a.cmp(b)).toStrictEqual(-1);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").cmp(new Decimal128("123.456"))
        ).toStrictEqual(-1);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").cmp(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(0);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").cmp(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(0);
    });
    test("non-example", () => {
        expect(
            new Decimal128("0.037").cmp(new Decimal128("0.037037037037"))
        ).toStrictEqual(-1);
    });
    describe("examples from a presentation", () => {
        let a = new Decimal128("1.00");
        let b = new Decimal128("1.0000");
        let c = new Decimal128("1.0001");
        let d = new Decimal128("0.9999");
        test("use mathematical equality by default", () => {
            expect(a.cmp(b)).toStrictEqual(0);
        });
        test("mathematically distinct", () => {
            expect(a.cmp(c)).toStrictEqual(-1);
        });
        test("mathematically distinct, again", () => {
            expect(b.cmp(d)).toStrictEqual(1);
        });
        test("mathematically distinct, once more", () => {
            expect(a.cmp(d)).toStrictEqual(1);
        });
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)).cmp(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(0);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal128("0." + "4".repeat(33)).cmp(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(-1);
    });
    describe("NaN", () => {
        test("NaN equals NaN throws", () => {
            expect(nan.cmp(nan)).toStrictEqual(NaN);
        });
        test("number equals NaN throws", () => {
            expect(one.cmp(nan)).toStrictEqual(NaN);
        });
        test("NaN equals number throws", () => {
            expect(nan.cmp(one)).toStrictEqual(NaN);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.cmp(zero)).toStrictEqual(0);
        });
        test("right hand", () => {
            expect(zero.cmp(negZero)).toStrictEqual(0);
        });
        test("both arguments", () => {
            expect(negZero.cmp(negZero)).toStrictEqual(0);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.cmp(one)).toStrictEqual(1);
        });
        test("negative infinity vs number", () => {
            expect(negInf.cmp(one)).toStrictEqual(-1);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.cmp(posInf)).toStrictEqual(-1);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.cmp(negInf)).toStrictEqual(1);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.cmp(posInf)).toStrictEqual(0);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.cmp(negInf)).toStrictEqual(0);
        });
        test("compare number to positive infinity", () => {
            expect(one.cmp(posInf)).toStrictEqual(-1);
        });
        test("compare number to negative infinity", () => {
            expect(one.cmp(negInf)).toStrictEqual(1);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.cmp(zero)).toStrictEqual(0);
    });
    test("negative zero", () => {
        expect(negZero.cmp(negZero)).toStrictEqual(0);
    });
    test("negative zero vs zero", () => {
        expect(negZero.cmp(zero)).toStrictEqual(0);
    });
    test("compare zero to positive", () => {
        expect(zero.cmp(one)).toStrictEqual(-1);
    });
    test("compare zero to negative", () => {
        expect(zero.cmp(one.negate())).toStrictEqual(1);
    });
});

describe("normalization", () => {
    let d1 = new Decimal128("1.2");
    let d2 = new Decimal128("1.20");
    let d3 = new Decimal128("1.200");
    test("compare normalized to normalized", () => {
        expect(d1.cmp(d2)).toStrictEqual(0);
    });
    test("compare normalized to normalized", () => {
        expect(d2.cmp(d3)).toStrictEqual(0);
    });
    test("compare normalized to normalized", () => {
        expect(d1.cmp(d3)).toStrictEqual(0);
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    describe("compare", () => {
        test("example one", () => {
            expect(
                new Decimal128("2.1").cmp(new Decimal128("3"))
            ).toStrictEqual(-1);
        });
        test("example two", () => {
            expect(
                new Decimal128("2.1").cmp(new Decimal128("2.1"))
            ).toStrictEqual(0);
        });
        test("example three", () => {
            expect(
                new Decimal128("2.1").cmp(new Decimal128("2.10"))
            ).toStrictEqual(0);
        });
        test("example four", () => {
            expect(
                new Decimal128("3").cmp(new Decimal128("2.1"))
            ).toStrictEqual(1);
        });
        test("example five", () => {
            expect(
                new Decimal128("2.1").cmp(new Decimal128("-3"))
            ).toStrictEqual(1);
        });
        test("example six", () => {
            expect(
                new Decimal128("-3").cmp(new Decimal128("2.1"))
            ).toStrictEqual(-1);
        });
    });
});
