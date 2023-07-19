import { Decimal128 } from "../src/decimal128.mjs";

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(Decimal128.round("1.5")).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(Decimal128.round("2.5")).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(Decimal128.round("2.6")).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(Decimal128.round("-1.5")).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(Decimal128.round("-2.5")).toStrictEqual("-2");
        });
        test("round down (positive)", () => {
            expect(Decimal128.round("1.1")).toStrictEqual("1");
        });
    });
    describe("round to one decimal place, with one decimal place available", () => {
        test("positive odd", () => {
            expect(Decimal128.round("1.5", 1)).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(Decimal128.round("2.5", 1)).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(Decimal128.round("2.6", 1)).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(Decimal128.round("-1.5", 1)).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(Decimal128.round("-2.5", 1)).toStrictEqual("-2");
        });
        test("round down (positive)", () => {
            expect(Decimal128.round("1.1", 1).toString()).toStrictEqual("1");
        });
    });
    describe("round to one decimal place, more than one decimal place available", () => {
        test("positive odd", () => {
            expect(Decimal128.round("1.75", 1)).toStrictEqual("1.8");
        });
        test("positive even", () => {
            expect(Decimal128.round("2.55", 1)).toStrictEqual("2.6");
        });
        test("round up (positive)", () => {
            expect(Decimal128.round("2.26", 1)).toStrictEqual("2.3");
        });
        test("negative odd", () => {
            expect(Decimal128.round("-1.95", 1)).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(Decimal128.round("-2.65", 1)).toStrictEqual("-2.6");
        });
        test("round down (positive)", () => {
            expect(Decimal128.round("1.81", 1)).toStrictEqual("1.8");
        });
    });
    test("round integer", () => {
        expect(Decimal128.round("42", 6)).toStrictEqual("42");
    });
    test("round with non-number number of digits", () => {
        expect(() => Decimal128.round("42", "1")).toThrow(TypeError);
    });
    test("round with non-integer number of digits", () => {
        expect(() => Decimal128.round("42", 1.5)).toThrow(TypeError);
    });
    test("round with negative number of digits", () => {
        expect(() => Decimal128.round("42", -1)).toThrow(RangeError);
    });
});
