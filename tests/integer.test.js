import { Decimal } from "../src/decimal.mjs";

describe("is-integer", () => {
    test("looks like positive integer", () => {
        expect(Decimal.isInteger("123")).toStrictEqual(true);
    });
    test("looks like negative integer", () => {
        expect(Decimal.isInteger("-456")).toStrictEqual(true);
    });
    test("zero is integer", () => {
        expect(Decimal.isInteger("0")).toStrictEqual(true);
    });
    test("positive integer point zero is integer", () => {
        expect(Decimal.isInteger("1234.0")).toStrictEqual(true);
    });
    test("negative integer point zero is integer", () => {
        expect(Decimal.isInteger("-987.0")).toStrictEqual(true);
    });
    test("positive non-integer", () => {
        expect(Decimal.isInteger("123.456")).toStrictEqual(false);
    });
    test("negative non-integer", () => {
        expect(Decimal.isInteger("-987.654")).toStrictEqual(false);
    });
});
