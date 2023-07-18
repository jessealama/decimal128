import { Decimal128 } from "../src/decimal128.mjs";

describe("truncate", () => {
    test("basic example", () => {
        expect(Decimal128.truncate("123.45678")).toStrictEqual("123");
    });
    test("truncate negative", () => {
        expect(Decimal128.truncate("-42.99")).toStrictEqual("-42");
    });
    test("between zero and one", () => {
        expect(Decimal128.truncate("0.00765")).toStrictEqual("0");
    });
});
