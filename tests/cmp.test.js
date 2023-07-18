import { Decimal } from "../src/decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("cmp", () => {
    let d1 = "987.123";
    let d2 = "123.456789";
    test("cmp is zero", () => {
        expect(Decimal.cmp(d1, d1)).toStrictEqual(0);
    });
    test("cmp is one", () => {
        expect(Decimal.cmp(d1, d2)).toStrictEqual(1);
    });
    test("cmp is minus one", () => {
        expect(Decimal.cmp(d2, d1)).toStrictEqual(-1);
    });
    test("negative numbers", () => {
        let a = "-123.456";
        let b = "-987.654";
        expect(Decimal.cmp(a, b)).toStrictEqual(1);
        expect(Decimal.cmp(b, a)).toStrictEqual(-1);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = "42.678";
        let b = "42.6789";
        expect(Decimal.cmp(a, b)).toStrictEqual(-1);
        expect(Decimal.cmp(b, a)).toStrictEqual(1);
    });
    test("negative and positive are different", () => {
        expect(Decimal.cmp("-123.456", "123.456")).toStrictEqual(-1);
    });
    test("limit of significant digits", () => {
        expect(
            Decimal.cmp(
                "0.4166666666666666666666666666666667",
                "0.4166666666666666666666666666666666"
            )
        ).toStrictEqual(1);
    });
    test("beyond limit of significant digits", () => {
        expect(
            Decimal.cmp(
                "0.41666666666666666666666666666666667",
                "0.41666666666666666666666666666666666"
            )
        ).toStrictEqual(0);
    });
    test("non-example", () => {
        expect(Decimal.cmp("0.037", "0.037037037037")).toStrictEqual(-1);
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            Decimal.cmp(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50),
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)
            )
        ).toStrictEqual(0);
    });
    test("non-equality within limits", () => {
        expect(
            Decimal.cmp(
                "0." + "4".repeat(33),
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)
            )
        ).toStrictEqual(-1);
    });
});
