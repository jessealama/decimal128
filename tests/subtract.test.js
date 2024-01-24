import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expectDecimal128(
            new Decimal128("123.456").subtract(new Decimal128("0.456")),
            "123.000"
        );
    });
    test("minus negative number", () => {
        expectDecimal128(
            new Decimal128("0.1").subtract(new Decimal128("-0.2")),
            "0.3"
        );
    });
    test("subtract two negatives", () => {
        expectDecimal128(
            new Decimal128("-1.9").subtract(new Decimal128("-2.7")),
            "0.8"
        );
    });
    const big = new Decimal128(bigDigits);
    test("close to range limit", () => {
        expectDecimal128(
            big.subtract(new Decimal128("9")),
            "9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0"
        );
    });
    test("integer overflow", () => {
        expect(() =>
            new Decimal128("-" + bigDigits).subtract(new Decimal128("9"))
        ).toThrow(RangeError);
    });
    describe("NaN", () => {
        test("NaN minus NaN is NaN", () => {
            expect(
                new Decimal128("NaN").subtract(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN minus number", () => {
            expect(
                new Decimal128("NaN").subtract(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number minus NaN", () => {
            expect(
                new Decimal128("1").subtract(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
});

describe("infinity", () => {
    let posInf = new Decimal128("Infinity");
    let negInf = new Decimal128("-Infinity");
    describe("first argument", () => {
        describe("positive infinity", () => {
            test("positive number", () => {
                expect(
                    posInf.subtract(new Decimal128("1")).toString()
                ).toStrictEqual("Infinity");
            });
            test("negative number", () => {
                expect(
                    posInf.subtract(new Decimal128("-1")).toString()
                ).toStrictEqual("Infinity");
            });
            test("positive infinity", () => {
                expect(posInf.subtract(posInf).toString()).toStrictEqual("NaN");
            });
            test("negative infinity", () => {
                expect(posInf.subtract(negInf).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });
        describe("negative infinity", () => {
            test("positive number", () => {
                expect(
                    negInf.subtract(new Decimal128("1")).toString()
                ).toStrictEqual("-Infinity");
            });
            test("negative number", () => {
                expect(
                    negInf.subtract(new Decimal128("-1")).toString()
                ).toStrictEqual("-Infinity");
            });
            test("positive infinity", () => {
                expect(negInf.subtract(posInf).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
            test("negative infinity", () => {
                expect(negInf.subtract(negInf).toString()).toStrictEqual("NaN");
            });
        });
    });
    describe("second argument", () => {
        describe("positive infinity", () => {
            test("finite", () => {
                expect(
                    new Decimal128("42").subtract(posInf).toString()
                ).toStrictEqual("-Infinity");
            });
            test("positive infinity", () => {
                expect(posInf.subtract(posInf).toString()).toStrictEqual("NaN");
            });
            test("negative infinity", () => {
                expect(posInf.subtract(negInf).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });
        describe("negative infinity", () => {
            test("finite", () => {
                expect(
                    new Decimal128("42").subtract(negInf).toString()
                ).toStrictEqual("Infinity");
            });
            test("positive infinity", () => {
                expect(negInf.subtract(posInf).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
            test("negative infinity", () => {
                expect(negInf.subtract(negInf).toString()).toStrictEqual("NaN");
            });
        });
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("example one", () => {
        expect(
            new Decimal128("1.3").subtract(new Decimal128("1.07")).toString()
        ).toStrictEqual("0.23");
    });
    test("example two", () => {
        expect(
            new Decimal128("1.3")
                .subtract(new Decimal128("1.30", { normalize: false }))
                .toString({ normalize: false })
        ).toStrictEqual("0.00");
    });
    test("example three", () => {
        expect(
            new Decimal128("1.3").subtract(new Decimal128("2.07")).toString()
        ).toStrictEqual("-0.77");
    });
});
