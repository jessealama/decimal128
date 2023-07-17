import { Decimal128 } from "../src/decimal128.mjs";

describe("truncate", () => {
    test("basic example", () => {
        expect(
            Decimal128.truncate(new Decimal128("123.45678")).toString()
        ).toStrictEqual("123");
    });
    test("truncate negative", () => {
        expect(
            Decimal128.truncate(new Decimal128("-42.99")).toString()
        ).toStrictEqual("-42");
    });
    test("between zero and one", () => {
        expect(
            Decimal128.truncate(new Decimal128("0.00765")).toString()
        ).toStrictEqual("0");
    });
});
