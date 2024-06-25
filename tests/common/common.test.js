import { countSignificantDigits } from "../src/common.mjs";

describe("significant digits", () => {
    test("basic example", () => {
        expect(countSignificantDigits("123.45678")).toStrictEqual(8);
    });
});
