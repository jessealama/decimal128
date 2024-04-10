import { Decimal128 } from "../src/decimal128.mts";

describe("valueOf", () => {
    test("throws unconditionally", () => {
        expect(() => {
            return 42 - new Decimal128("42");
        }).toThrow(TypeError);
    });
});
