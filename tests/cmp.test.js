import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const one = new Decimal128("1");

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
    test("different number of digits", () => {
        expect(
            new Decimal128("123.456").cmp(new Decimal128("123.4561"))
        ).toStrictEqual(0);
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
        ).toStrictEqual(-1);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").cmp(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        );
    });
    test("equality works", () => {
        expect(new Decimal128("123").cmp(new Decimal128("123"))).toStrictEqual(
            0
        );
    });
    test("equality works with different number of digits", () => {
        expect(
            new Decimal128("123").cmp(new Decimal128("123.1"))
        ).toStrictEqual(-1);
    });
    test("non-example", () => {
        expect(
            new Decimal128("0.037").cmp(new Decimal128("0.037037037037"))
        ).toStrictEqual(-1);
    });
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
            new Decimal128("0." + "4".repeat(50)).cmp(
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
    test("non-integer works out to be integer", () => {
        expect(
            new Decimal128(
                "1.00000000000000000000000000000000000000000000000001"
            ).cmp(one)
        ).toStrictEqual(0);
    });
});
