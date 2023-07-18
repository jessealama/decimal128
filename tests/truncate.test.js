import { Decimal } from "../src/decimal.mjs";

describe("truncate", () => {
    test("basic example", () => {
        expect(Decimal.truncate("123.45678")).toStrictEqual("123");
    });
    test("truncate negative", () => {
        expect(Decimal.truncate("-42.99")).toStrictEqual("-42");
    });
    test("between zero and one", () => {
        expect(Decimal.truncate("0.00765")).toStrictEqual("0");
    });
});
