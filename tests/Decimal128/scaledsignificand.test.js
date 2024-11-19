import JSBI from "jsbi";
import { Decimal128 } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    expect(() => new Decimal128("NaN").scaledSignificand()).toThrow(RangeError);
});

describe("infinities", () => {
    test("positive throws", () => {
        expect(() => new Decimal128("Infinity").scaledSignificand()).toThrow(
            RangeError
        );
    });
    test("negative throws", () => {
        expect(() => new Decimal128("-Infinity").scaledSignificand()).toThrow(
            RangeError
        );
    });
});

describe("finite values", () => {
    test("0", () => {
        expect(new Decimal128("0").scaledSignificand()).toStrictEqual(
            JSBI.BigInt(0)
        );
    });
    test("-0", () => {
        expect(new Decimal128("-0").scaledSignificand()).toStrictEqual(
            JSBI.BigInt(0)
        );
    });
    let solution = JSBI.BigInt("420000000000000000000000000");
    test("simple number, greater than 10, with exponent apparently at limit", () => {
        expect(new Decimal128("42E-6143").scaledSignificand()).toStrictEqual(
            JSBI.multiply(
                JSBI.BigInt(42),
                JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(32))
            )
        );
    });
    test("simple number between 1 and 10 with exponent apparently at limit", () => {
        expect(new Decimal128("4.2E-6143").scaledSignificand()).toStrictEqual(
            JSBI.multiply(
                JSBI.BigInt(42),
                JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(32))
            )
        );
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal128("4.2E-6150").scaledSignificand()).toStrictEqual(
            JSBI.multiply(
                JSBI.BigInt(42),
                JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(25))
            )
        );
    });
});
