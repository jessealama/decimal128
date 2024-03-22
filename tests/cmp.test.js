import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("cmp", () => {
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
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").cmp(new Decimal128("123.456"))
        ).toStrictEqual(-1);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").cmp(
                new Decimal128("0.4166666666666666666666666666666666")
            )
        ).toStrictEqual(1);
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
        test("take trailing zeroes into account", () => {
            expect(a.cmp(b, { total: true })).toStrictEqual(1);
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
        test("NaN cmp NaN is NaN", () => {
            expect(
                new Decimal128("NaN").cmp(new Decimal128("NaN"))
            ).toStrictEqual(undefined);
        });
        test("NaN cmp NaN is not NaN, with total comparison", () => {
            expect(
                new Decimal128("NaN").cmp(new Decimal128("NaN"), {
                    total: true,
                })
            ).toStrictEqual(0);
        });
        test("number cmp NaN is NaN", () => {
            expect(
                new Decimal128("1").cmp(new Decimal128("NaN"))
            ).toStrictEqual(undefined);
        });
        test("number cmp NaN is not NaN, with total comparison", () => {
            expect(
                new Decimal128("1").cmp(new Decimal128("NaN"), { total: true })
            ).toStrictEqual(-1);
        });
        test("NaN cmp number is NaN", () => {
            expect(
                new Decimal128("NaN").cmp(new Decimal128("1"))
            ).toStrictEqual(undefined);
        });
        test("NaN cmp number is not NaN, with total comparison", () => {
            expect(
                new Decimal128("NaN").cmp(new Decimal128("1"), { total: true })
            ).toStrictEqual(1);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(new Decimal128("-0").cmp(new Decimal128("0"))).toStrictEqual(
                0
            );
        });
        test("right hand", () => {
            expect(new Decimal128("0").cmp(new Decimal128("-0"))).toStrictEqual(
                0
            );
        });
        test("both arguments", () => {
            expect(
                new Decimal128("-0").cmp(new Decimal128("-0"))
            ).toStrictEqual(0);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.cmp(new Decimal128("1"))).toStrictEqual(1);
        });
        test("negative infinity vs number", () => {
            expect(negInf.cmp(new Decimal128("1"))).toStrictEqual(-1);
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
            expect(new Decimal128("1").cmp(posInf)).toStrictEqual(-1);
        });
        test("compare number to negative infinity", () => {
            expect(new Decimal128("1").cmp(negInf)).toStrictEqual(1);
        });
    });
});

describe("zero", () => {
    let zero = new Decimal128("0");
    let negZero = new Decimal128("-0");
    test("positive zero", () => {
        expect(zero.cmp(zero)).toStrictEqual(0);
    });
    test("negative zero", () => {
        expect(negZero.cmp(negZero)).toStrictEqual(0);
    });
    test("negative zero vs zero", () => {
        expect(negZero.cmp(zero)).toStrictEqual(0);
    });
    test("negative zero vs zero, normalization disabled", () => {
        expect(negZero.cmp(zero, { total: true })).toStrictEqual(-1);
    });
    test("zero vs negative zero, normalization disabled", () => {
        expect(zero.cmp(negZero, { total: true })).toStrictEqual(1);
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
    test("compare non-normal (1)", () => {
        expect(d1.cmp(d2, { total: true })).toStrictEqual(1);
    });
    test("compare non-normal (2)", () => {
        expect(d2.cmp(d1, { total: true })).toStrictEqual(-1);
    });
    test("compare two non-normal values", () => {
        expect(d2.cmp(d3, { total: true })).toStrictEqual(1);
    });
    test("compare two non-normal values", () => {
        expect(d3.cmp(d2, { total: true })).toStrictEqual(-1);
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
        test("example five", () => {
            expect(
                new Decimal128("-3").cmp(new Decimal128("2.1"))
            ).toStrictEqual(-1);
        });
    });
    describe("compare-total", () => {
        test("example one", () => {
            expect(
                new Decimal128("12.73").cmp(new Decimal128("127.9"), {
                    total: true,
                })
            ).toStrictEqual(-1);
        });
        test("example two", () => {
            expect(
                new Decimal128("-127").cmp(new Decimal128("12"), {
                    total: true,
                })
            ).toStrictEqual(-1);
        });
        test("example three", () => {
            expect(
                new Decimal128("12.30").cmp(new Decimal128("12.3"), {
                    total: true,
                })
            ).toStrictEqual(-1);
        });
        test("example four", () => {
            expect(
                new Decimal128("12.30").cmp(new Decimal128("12.30"), {
                    total: true,
                })
            ).toStrictEqual(0);
        });
        test("example five", () => {
            expect(
                new Decimal128("12.3").cmp(new Decimal128("12.300"), {
                    total: true,
                })
            ).toStrictEqual(1);
        });
        test("example six", () => {
            expect(
                new Decimal128("12.3").cmp(new Decimal128("NaN"), {
                    total: true,
                })
            ).toStrictEqual(-1);
        });
        describe("inline examples", () => {
            test("example one", () => {
                expect(
                    new Decimal128("-Infinity").cmp(new Decimal128("-127"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example two", () => {
                expect(
                    new Decimal128("-1.00").cmp(new Decimal128("-1"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example three", () => {
                expect(
                    new Decimal128("-0.000").cmp(new Decimal128("-0"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example four", () => {
                expect(
                    new Decimal128("-0").cmp(new Decimal128("0"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example five", () => {
                expect(
                    new Decimal128("1.2300").cmp(new Decimal128("1.23"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example six", () => {
                expect(
                    new Decimal128("1.23").cmp(new Decimal128("1E+9"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example seven", () => {
                expect(
                    new Decimal128("1E+9").cmp(new Decimal128("Infinity"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
            test("example eight", () => {
                expect(
                    new Decimal128("Infinity").cmp(new Decimal128("NaN"), {
                        total: true,
                    })
                ).toStrictEqual(-1);
            });
        });
    });
});
