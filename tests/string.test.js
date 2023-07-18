import { Decimal128 } from "../src/decimal128.mjs";
import { Decimal } from "../src/decimal.mjs";

const d = "123.456";

describe("to decimal places", function () {
    test("more digits than available means no change", () => {
        expect(Decimal.toDecimalPlaces(d, 7)).toStrictEqual("123.456");
    });
    test("same number of digits as available means no change", () => {
        expect(Decimal.toDecimalPlaces(d, 6)).toStrictEqual("123.456");
    });
    test("round if number has more digits than requested (1)", () => {
        expect(Decimal.toDecimalPlaces(d, 5)).toStrictEqual("123.456");
    });
    test("round if number has more digits than requested (2)", () => {
        expect(Decimal.toDecimalPlaces(d, 4)).toStrictEqual("123.456");
    });
    test("round if number has more digits than requested (3)", () => {
        expect(Decimal.toDecimalPlaces(d, 3)).toStrictEqual("123.456");
    });
    test("round if number has more digits than requested (4)", () => {
        expect(Decimal.toDecimalPlaces(d, 2)).toStrictEqual("123.46");
    });
    test("round if number has more digits than requested (5)", () => {
        expect(Decimal.toDecimalPlaces(d, 1)).toStrictEqual("123.5");
    });
    test("zero decimal places", () => {
        expect(Decimal.toDecimalPlaces(d, 0)).toStrictEqual("123");
    });
    test("negative number of decimal places", () => {
        expect(() => Decimal.toDecimalPlaces(d, -1)).toThrow(RangeError);
    });
    test("non-integer number of decimal places", () => {
        expect(() => Decimal.toDecimalPlaces(d, 1.5)).toThrow(TypeError);
    });
});

describe("to exponential string", () => {
    let data = {
        "123456E-2": "123456E-2",
        123.456: "123456E-3",
        "-123.456": "-123456E-3",
        0: "0E0",
        1: "1E0",
    };
    for (let [input, output] of Object.entries(data)) {
        expect(Decimal.toExponentialString(input)).toStrictEqual(output);
    }
});
