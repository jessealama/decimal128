import { Decimal128 } from "../src/decimal128";

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(new Decimal128("123.456").ceil().equals(new Decimal128("124")));
    });
    test("ceiling works (negative)", () => {
        expect(
            new Decimal128("-123.456").ceil().equals(new Decimal128("-123"))
        );
    });
    test("ceiling of an integer is unchanged", () => {
        expect(new Decimal128("123").ceil().equals(new Decimal128("123")));
    });
});
