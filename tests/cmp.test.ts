import { Decimal128 } from "../src/decimal128";

describe("cmp", function () {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("cmp is zero", () => {
        expect(Decimal128.cmp(d1, d1)).toStrictEqual(0);
    });
    test("cmp is one", () => {
        expect(Decimal128.cmp(d1, d2)).toStrictEqual(1);
    });
    test("cmp is minus one", () => {
        expect(Decimal128.cmp(d2, d1)).toStrictEqual(-1);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        let b = new Decimal128("-987.654");
        expect(Decimal128.cmp(a, b)).toStrictEqual(1);
        expect(Decimal128.cmp(b, a)).toStrictEqual(-1);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(Decimal128.cmp(a, b)).toStrictEqual(-1);
        expect(Decimal128.cmp(b, a)).toStrictEqual(1);
    });
});
