import { Decimal128 } from "../src/decimal128";

const zero = new Decimal128("0");
const minusThree = new Decimal128("-3");

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(new Decimal128("123.456").floor().equals(new Decimal128("123")));
        expect(new Decimal128("-2.5").floor().equals(minusThree));
    });
    test("floor works (negative)", () => {
        expect(
            new Decimal128("-123.456").floor().equals(new Decimal128("-124"))
        );
    });
    test("floor of integer is unchanged", () => {
        expect(new Decimal128("123").floor().equals(new Decimal128("123")));
    });
    test("floor of zero is unchanged", () => {
        expect(zero.floor().equals(zero));
    });
});
