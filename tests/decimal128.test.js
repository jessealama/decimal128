import { Decimal128 } from "../src/decimal128.mjs";

describe("basic checks", () => {
    test("cannot construct Decimal128 values", () => {
        expect(() => new Decimal128("123.456")).toThrow(Error);
    });
});
