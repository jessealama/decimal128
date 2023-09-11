import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal128("0");
const one = new Decimal128("1");
const minusOne = new Decimal128("-1");
const two = new Decimal128("2");

describe("addition" + "", () => {
    test("one plus one equals two", () => {
        expect(one.add(one).toString()).toStrictEqual("2");
    });
    test("one plus minus one equals zero", () => {
        expect(one.add(minusOne).toString()).toStrictEqual("0");
        expect(minusOne.add(one).toString()).toStrictEqual("0");
    });
    test("two negatives", () => {
        expect(minusOne.add(new Decimal128("-99").toString())).toStrictEqual("-100");
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = "0.1";
        let b = "0.2";
        let c = "0.3";
        expect(new Decimal128(a).add(new Decimal128(b)).toString()).toStrictEqual(c);
        expect(new Decimal128(b).add(new Decimal128(a)).toString()).toStrictEqual(c);
    });
    let big = new Decimal128(bigDigits);
    test("big plus zero is OK", () => {
        expect(big.add(zero).toString()).toStrictEqual(bigDigits);
    });
    test("zero plus big is OK", () => {
        expect(zero.add(big).toString()).toStrictEqual(bigDigits);
    });
    test("big plus one is OK", () => {
        expect(big.add(one).toString()).toStrictEqual(one.add(big).toString());
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => two.add(big)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => big.add(two)).toThrow(RangeError);
    });
});
