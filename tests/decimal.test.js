import { Decimal } from "../src/decimal.mjs";

describe("Decimal", () => {
    test("no constructor", () => {
        expect(() => new Decimal("123")).toThrow(Error);
    });
});
