import { Decimal128, DecimalCalculator } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("no rounding options given", () => {
    let nines = "41." + "9".repeat(MAX_SIGNIFICANT_DIGITS + 1);
    test("default is to round ties up", () => {
        expect(new Decimal128(nines).toString()).toStrictEqual("42");
    });
});

describe("rounding mode: half-up", () => {
    let nines = "41." + "9".repeat(MAX_SIGNIFICANT_DIGITS + 1);
    test("round up (non-tie)", () => {
        expect(
            new Decimal128(nines, { "rounding-mode": "half-up" }).toString()
        ).toStrictEqual("42");
    });
    test("round up, max significant digits (tie)", () => {
        let d = new Decimal128("41.5", {
            "rounding-mode": "half-up",
            "max-significant-digits": 2,
        });
        expect(d.toString()).toStrictEqual("42");
    });
    test("half even, max significant digits (tie)", () => {
        let d = new Decimal128("41.5", {
            "rounding-mode": "half-even",
            "max-significant-digits": 2,
        });
        expect(d.toString()).toStrictEqual("42");
    });
    test("truncate, max significant digits (tie)", () => {
        let d = new Decimal128("41.5", {
            "rounding-mode": "truncate",
            "max-significant-digits": 2,
        });
        expect(d.toString()).toStrictEqual("41");
    });
});
