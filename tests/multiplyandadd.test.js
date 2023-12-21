import { Decimal128 } from "../src/decimal128.mjs";

let posInf = new Decimal128("Infinity");
let negInf = new Decimal128("-Infinity");
let nan = new Decimal128("NaN");

describe("fused multiply and add", () => {
    test("zero", () => {
        expect(
            new Decimal128("0")
                .multiplyAndAdd(new Decimal128("0"), new Decimal128("0"))
                .toString()
        ).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(
            new Decimal128("1")
                .multiplyAndAdd(new Decimal128("-0"), new Decimal128("0"))
                .toString()
        ).toStrictEqual("0");
    });
    test("integers", () => {
        expect(
            new Decimal128("2")
                .multiplyAndAdd(new Decimal128("3"), new Decimal128("4"))
                .toString()
        ).toStrictEqual("10");
    });
    describe("NaN", () => {
        describe("neither argument is NaN", () => {
            test("NaN times -5 plus 19 is NaN", () => {
                expect(
                    nan
                        .multiplyAndAdd(
                            new Decimal128("-5"),
                            new Decimal128("19")
                        )
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        describe("first argument is NaN", () => {
            test("42 times NaN plus 42 is NaN", () => {
                expect(
                    new Decimal128("42")
                        .multiplyAndAdd(nan, new Decimal128("42"))
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        describe("second argument is NaN", () => {
            test("two times five plus NaN is NaN", () => {
                expect(
                    new Decimal128("2")
                        .multiplyAndAdd(new Decimal128("5"), nan)
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        describe("both arguments are NaN", () => {
            test("NaN times NaN plus NaN is NaN", () => {
                expect(nan.multiplyAndAdd(nan, nan).toString()).toStrictEqual(
                    "NaN"
                );
            });
            test("one times NaN plus NaN is NaN", () => {
                expect(
                    new Decimal128("1").multiplyAndAdd(nan, nan).toString()
                ).toStrictEqual("NaN");
            });
        });
    });
    describe("infinity", () => {
        describe("initial argument", () => {
            test("first argument is zero", () => {
                expect(
                    posInf
                        .multiplyAndAdd(
                            new Decimal128("0"),
                            new Decimal128("42")
                        )
                        .toString()
                ).toStrictEqual("NaN");
            });
            test("first argument is non-zero", () => {
                expect(
                    posInf
                        .multiplyAndAdd(
                            new Decimal128("42"),
                            new Decimal128("42")
                        )
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("minus infinity, all arguments non-zero", () => {
                expect(
                    negInf
                        .multiplyAndAdd(
                            new Decimal128("42"),
                            new Decimal128("42")
                        )
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
        describe("first argument", () => {
            test("42 times infinity plus 42 is infinity", () => {
                expect(
                    new Decimal128("42")
                        .multiplyAndAdd(posInf, new Decimal128("42"))
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("42 times minus infinity plus 42 is minus infinity", () => {
                expect(
                    new Decimal128("42")
                        .multiplyAndAdd(negInf, new Decimal128("42"))
                        .toString()
                ).toStrictEqual("-Infinity");
            });
            test("zero yields NaN", () => {
                expect(
                    new Decimal128("0")
                        .multiplyAndAdd(posInf, new Decimal128("42"))
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        describe("second argument", () => {
            test("one times infinity plus four is infinity", () => {
                expect(
                    new Decimal128("1")
                        .multiplyAndAdd(posInf, new Decimal128("4"))
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("one times negative infinity plus 42", () => {
                expect(
                    new Decimal128("1")
                        .multiplyAndAdd(negInf, new Decimal128("42"))
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
        describe("both first and second arguments", () => {
            test("infinity times infinity plus infinity is infinity", () => {
                expect(
                    new Decimal128("Infinity")
                        .multiplyAndAdd(posInf, posInf)
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("infinity times minus infinity plus infinity is NaN", () => {
                expect(
                    new Decimal128("Infinity")
                        .multiplyAndAdd(negInf, posInf)
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        describe("third argument", () => {
            test("one times one plus infinity is infinity", () => {
                expect(
                    new Decimal128("1")
                        .multiplyAndAdd(new Decimal128("1"), posInf)
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("one times one plus minus infinity is minus infinity", () => {
                expect(
                    new Decimal128("1")
                        .multiplyAndAdd(new Decimal128("1"), negInf)
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
    });
});

describe("tests from the General Decimal Arithmetic Specification", () => {
    test("example one", () => {
        expect(
            new Decimal128("3")
                .multiplyAndAdd(new Decimal128("5"), new Decimal128("7"))
                .toString()
        ).toStrictEqual("22");
    });
    test("example two", () => {
        expect(
            new Decimal128("3")
                .multiplyAndAdd(new Decimal128("-5"), new Decimal128("7"))
                .toString()
        ).toStrictEqual("-8");
    });
    test("example three", () => {
        // in the docs, the answer is 1.38435736E+12 but we have more precision
        expect(
            new Decimal128("888565290")
                .multiplyAndAdd(
                    new Decimal128("1557.96930"),
                    new Decimal128("-86087.7578")
                )
                .toExponentialString()
        ).toStrictEqual("1.3843573567778392E+12");
    });
});
