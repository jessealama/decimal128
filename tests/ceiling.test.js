import { Decimal128 } from "../src/decimal128.mjs";

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(new Decimal128("123.456").ceil().toString()).toStrictEqual(
            "124"
        );
    });
    test("ceiling works (negative)", () => {
        expect(new Decimal128("-123.456").ceil().toString()).toStrictEqual(
            "-123"
        );
    });
    test("ceiling of an integer is unchanged", () => {
        expect(new Decimal128("123").ceil().toString()).toStrictEqual("123");
    });
});
