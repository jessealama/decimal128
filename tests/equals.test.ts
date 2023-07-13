import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

const one = new Decimal128("1");

describe("equals", () => {
    test("simple case", () => {
        expect(new Decimal128("123.456").equals(new Decimal128("123.456")));
    });
    test("different number of digits", () => {
        expect(
            new Decimal128("123.456").equals(new Decimal128("123.4561"))
        ).toBeFalsy();
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").equals(new Decimal128("123.456"))
        ).toBeFalsy();
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").equals(
                new Decimal128("0.4166666666666666666666666666666666")
            )
        ).toBeFalsy();
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").equals(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        );
    });
    test("equality works", () => {
        expect(
            new Decimal128("123").equals(new Decimal128("123"))
        ).toBeTruthy();
    });
    test("equality works with different number of digits", () => {
        expect(
            new Decimal128("123").equals(new Decimal128("123.1"))
        ).toBeFalsy();
    });
    test("non-example", () => {
        expect(
            new Decimal128("0.037").equals(new Decimal128("0.037037037037"))
        ).toBeFalsy();
    });
    describe("many digits", () => {
        test("integer too large", () => {
            expect(
                () =>
                    new Decimal128(
                        "100000000000000000000000000000000000000000000000001"
                    )
            ).toThrow(RangeError);
        });
        test("non-integers get rounded", () => {
            expect(
                new Decimal128("0." + "4".repeat(50)).equals(
                    new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            );
        });
        test("non-equality within limits", () => {
            expect(
                new Decimal128("0." + "4".repeat(33)).equals(
                    new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            ).toBeFalsy();
        });
        test("non-integer works out to be integer", () => {
            expect(
                new Decimal128(
                    "1.00000000000000000000000000000000000000000000000001"
                ).equals(one)
            );
        });
    });
});
