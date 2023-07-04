import { Decimal128 } from "../src/decimal128";

const zero = new Decimal128("0");

describe("truncate", () => {
    test("basic example", () => {
        expect(
            new Decimal128("123.45678").truncate().equals(new Decimal128("123"))
        );
    });
    test("truncate negative", () => {
        expect(
            new Decimal128("-42.99").truncate().equals(new Decimal128("-42"))
        );
    });
    test("between zero and one", () => {
        expect(new Decimal128("0.00765").truncate().equals(zero));
    });
});
