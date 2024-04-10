import { Decimal128 } from "../src/decimal128.mts";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal128("NaN");
const zero = new Decimal128("0");
const negZero = new Decimal128("-0");
const one = new Decimal128("1");

describe("equals", () => {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("simple example", () => {
        expect(d1.equals(d1)).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(d1.equals(d2)).toStrictEqual(false);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        expect(a.equals(a)).toStrictEqual(true);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(a.equals(b)).toStrictEqual(false);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").equals(new Decimal128("123.456"))
        ).toStrictEqual(false);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").equals(
                new Decimal128("0.4166666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").equals(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(
            new Decimal128("0.037").equals(new Decimal128("0.037037037037"))
        ).toStrictEqual(false);
    });
    describe("examples from a presentation", () => {
        let a = new Decimal128("1.00");
        let b = new Decimal128("1.0000");
        let c = new Decimal128("1.0001");
        let d = new Decimal128("0.9999");
        test("use mathematical equality by default", () => {
            expect(a.equals(b)).toStrictEqual(true);
        });
        test("take trailing zeroes into account", () => {
            expect(a.equals(b, { normalize: true })).toStrictEqual(false);
        });
        test("mathematically distinct", () => {
            expect(a.equals(c)).toStrictEqual(false);
        });
        test("mathematically distinct, again", () => {
            expect(b.equals(d)).toStrictEqual(false);
        });
        test("mathematically distinct, once more", () => {
            expect(a.equals(d)).toStrictEqual(false);
        });
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal128(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
            ).equals(new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)))
        ).toStrictEqual(true);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal128("0." + "4".repeat(33)).equals(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(false);
    });
    describe("NaN", () => {
        test("NaN equals NaN, even if total is false", () => {
            expect(nan.equals(nan)).toStrictEqual(false);
        });
        test("NaN does equal NaN, with total comparison", () => {
            expect(
                nan.equals(nan, {
                    normalize: true,
                })
            ).toStrictEqual(true);
        });
        test("number equals NaN is false", () => {
            expect(one.equals(nan)).toStrictEqual(false);
        });
        test("number equals NaN fails, with total comparison", () => {
            expect(
                one.equals(nan, {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("NaN equals number", () => {
            expect(nan.equals(one)).toStrictEqual(false);
        });
        test("NaN equals number is false, with total comparison", () => {
            expect(
                nan.equals(one, {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.equals(zero)).toStrictEqual(true);
        });
        test("right hand", () => {
            expect(zero.equals(negZero)).toStrictEqual(true);
        });
        test("both arguments", () => {
            expect(negZero.equals(negZero)).toStrictEqual(true);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.equals(one)).toStrictEqual(false);
        });
        test("negative infinity vs number", () => {
            expect(negInf.equals(one)).toStrictEqual(false);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.equals(posInf)).toStrictEqual(false);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.equals(negInf)).toStrictEqual(false);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.equals(posInf)).toStrictEqual(true);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.equals(negInf)).toStrictEqual(true);
        });
        test("compare number to positive infinity", () => {
            expect(one.equals(posInf)).toStrictEqual(false);
        });
        test("compare number to negative infinity", () => {
            expect(one.equals(negInf)).toStrictEqual(false);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.equals(zero)).toStrictEqual(true);
    });
    test("negative zero", () => {
        expect(negZero.equals(negZero)).toStrictEqual(true);
    });
    test("negative zero vs zero", () => {
        expect(negZero.equals(zero)).toStrictEqual(true);
    });
    test("negative zero vs zero, normalization disabled", () => {
        expect(negZero.equals(zero, { normalize: true })).toStrictEqual(false);
    });
    test("zero vs negative zero, normalization disabled", () => {
        expect(zero.equals(negZero, { normalize: true })).toStrictEqual(false);
    });
});

describe("normalization", () => {
    let d1 = new Decimal128("1.2");
    let d2 = new Decimal128("1.20");
    let d3 = new Decimal128("1.200");
    test("compare normalized to normalized", () => {
        expect(d1.equals(d2)).toStrictEqual(true);
    });
    test("compare normalized to normalized", () => {
        expect(d2.equals(d3)).toStrictEqual(true);
    });
    test("compare normalized to normalized", () => {
        expect(d1.equals(d3)).toStrictEqual(true);
    });
    test("compare non-normal (1)", () => {
        expect(d1.equals(d2, { normalize: true })).toStrictEqual(false);
    });
    test("compare non-normal (2)", () => {
        expect(d2.equals(d1, { normalize: true })).toStrictEqual(false);
    });
    test("compare two non-normal values", () => {
        expect(d2.equals(d3, { normalize: true })).toStrictEqual(false);
    });
    test("compare two non-normal values", () => {
        expect(d3.equals(d2, { normalize: true })).toStrictEqual(false);
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    describe("compare", () => {
        test("example one", () => {
            expect(
                new Decimal128("2.1").equals(new Decimal128("3"))
            ).toStrictEqual(false);
        });
        test("example two", () => {
            expect(
                new Decimal128("2.1").equals(new Decimal128("2.1"))
            ).toStrictEqual(true);
        });
        test("example three", () => {
            expect(
                new Decimal128("2.1").equals(new Decimal128("2.10"))
            ).toStrictEqual(true);
        });
        test("example four", () => {
            expect(
                new Decimal128("3").equals(new Decimal128("2.1"))
            ).toStrictEqual(false);
        });
        test("example five", () => {
            expect(
                new Decimal128("2.1").equals(new Decimal128("-3"))
            ).toStrictEqual(false);
        });
        test("example five", () => {
            expect(
                new Decimal128("-3").equals(new Decimal128("2.1"))
            ).toStrictEqual(false);
        });
    });
    describe("compare-total", () => {
        test("example one", () => {
            expect(
                new Decimal128("12.73").equals(new Decimal128("127.9"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example two", () => {
            expect(
                new Decimal128("-127").equals(new Decimal128("12"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example three", () => {
            expect(
                new Decimal128("12.30").equals(new Decimal128("12.3"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example four", () => {
            expect(
                new Decimal128("12.30").equals(new Decimal128("12.30"), {
                    normalize: true,
                })
            ).toStrictEqual(true);
        });
        test("example five", () => {
            expect(
                new Decimal128("12.3").equals(new Decimal128("12.300"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        test("example six", () => {
            expect(
                new Decimal128("12.3").equals(new Decimal128("NaN"), {
                    normalize: true,
                })
            ).toStrictEqual(false);
        });
        describe("inline examples", () => {
            test("example one", () => {
                expect(
                    new Decimal128("-Infinity").equals(new Decimal128("-127"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example two", () => {
                expect(
                    new Decimal128("-1.00").equals(new Decimal128("-1"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example three", () => {
                expect(
                    new Decimal128("-0.000").equals(negZero, {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example four", () => {
                expect(
                    negZero.equals(zero, {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example five", () => {
                expect(
                    new Decimal128("1.2300").equals(new Decimal128("1.23"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example six", () => {
                expect(
                    new Decimal128("1.23").equals(new Decimal128("1E+9"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example seven", () => {
                expect(
                    new Decimal128("1E+9").equals(new Decimal128("Infinity"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
            test("example eight", () => {
                expect(
                    new Decimal128("Infinity").equals(new Decimal128("NaN"), {
                        normalize: true,
                    })
                ).toStrictEqual(false);
            });
        });
    });
});

describe("examples from a presentation at TC39 plenary", () => {
    test("NaN with a payload", () => {
        expect(
            new Decimal128("NaN").equals(new Decimal128("NaN123"))
        ).toStrictEqual(false);
    });
});
