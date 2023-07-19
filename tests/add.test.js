import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("addition" + "", () => {
    test("one plus one equals two", () => {
        expect(Decimal128.add("1", "1")).toStrictEqual("2");
    });
    test("one plus minus one equals zero", () => {
        expect(Decimal128.add("1", "-1")).toStrictEqual("0");
        expect(Decimal128.add("-1", "1")).toStrictEqual("0");
    });
    test("two negatives", () => {
        expect(Decimal128.add("-1", "-99")).toStrictEqual("-100");
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = "0.1";
        let b = "0.2";
        let c = "0.3";
        expect(Decimal128.add(a, b)).toStrictEqual(c);
        expect(Decimal128.add(b, a)).toStrictEqual(c);
    });
    test("big plus zero is OK", () => {
        expect(Decimal128.add(bigDigits, "0")).toStrictEqual(bigDigits);
    });
    test("zero plus big is OK", () => {
        expect(Decimal128.add("0", bigDigits)).toStrictEqual(bigDigits);
    });
    test("big plus one is OK", () => {
        expect(Decimal128.add(bigDigits, "1")).toStrictEqual(
            Decimal128.add("1", bigDigits)
        );
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => Decimal128.add("2", bigDigits)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => Decimal128.add(bigDigits, "2")).toThrow(RangeError);
    });
});
