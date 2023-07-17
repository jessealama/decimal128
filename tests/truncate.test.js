import { Decimal128 } from "../src/decimal128.mjs";

describe("truncate", () => {
    test("basic example", () => {
        expect(new Decimal128("123.45678").truncate().toString()).toStrictEqual(
            "123"
        );
    });
    test("truncate negative", () => {
        expect(new Decimal128("-42.99").truncate().toString()).toStrictEqual(
            "-42"
        );
    });
    test("between zero and one", () => {
        expect(new Decimal128("0.00765").truncate().toString()).toStrictEqual(
            "0"
        );
    });
});
