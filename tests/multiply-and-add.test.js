import { Decimal128 } from "../src/decimal128.mjs";

describe("basic checks", () => {
    test("simple example", () => {
        expect(Decimal128.multiplyAndAdd("7", "-8", "3.14")).toStrictEqual(
            "-52.86"
        );
    });
});
