import { Decimal128 } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const zero = new Decimal128("0");
const one = new Decimal128("1");
const two = new Decimal128("2");
const three = new Decimal128("3");
const four = new Decimal128("4");
const ten = new Decimal128("10");

describe("addition" + "", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    let big = new Decimal128(bigDigits);
    let minusOne = new Decimal128("-1");
    test("big is at the limit (cannot add more digits)", () => {
        expect(() => new Decimal128("9" + bigDigits)).toThrow(RangeError);
    });
    test("one plus one equals two", () => {
        expect(one.add(one).equals(two));
    });
    test("one plus minus one equals zero", () => {
        expect(one.add(minusOne).equals(zero));
        expect(minusOne.add(one).equals(zero));
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = new Decimal128("0.1");
        let b = new Decimal128("0.2");
        let c = new Decimal128("0.3");
        expect(a.add(b).equals(c));
        expect(b.add(a).equals(c));
    });
    test("big plus zero is OK", () => {
        expect(big.equals(big.add(zero)));
    });
    test("zero plus big is OK", () => {
        expect(big.equals(zero.add(big)));
    });
    test("big plus one is OK", () => {
        expect(big.add(one).equals(one.add(big)));
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => two.add(big)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => big.add(two)).toThrow(RangeError);
    });
});
