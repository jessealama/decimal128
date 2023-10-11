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
        test("number cmp NaN is NaN", () => {
            expect(
                new Decimal128("1").cmp(new Decimal128("NaN"))
            ).toStrictEqual(undefined);
        });
        test("NaN cmp number is NaN", () => {
            expect(
                new Decimal128("NaN").cmp(new Decimal128("1"))
            ).toStrictEqual(undefined);
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
    });
});
