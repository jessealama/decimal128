import { Decimal128 } from "../src/decimal128";

const d = new Decimal128("123.456");

describe("to decimal places", function () {
    // test("more digits than available means no change", () => {
    //     expect(d.toDecimalPlaces(7).toString()).toStrictEqual("123.456");
    // });
    // test("same number of digits as available means no change", () => {
    //     expect(d.toDecimalPlaces(6).toString()).toStrictEqual("123.456");
    // });
    // test("round if number has more digits than requested (1)", () => {
    //     expect(d.toDecimalPlaces(5).toString()).toStrictEqual("123.456");
    // });
    // test("round if number has more digits than requested (2)", () => {
    //     expect(d.toDecimalPlaces(4).toString()).toStrictEqual("123.456");
    // });
    // test("round if number has more digits than requested (3)", () => {
    //     expect(d.toDecimalPlaces(3).toString()).toStrictEqual("123.456");
    // });
    test("round if number has more digits than requested (4)", () => {
        expect(d.toDecimalPlaces(2).toString()).toStrictEqual("123.46");
    });
    // test("round if number has more digits than requested (5)", () => {
    //     expect(d.toDecimalPlaces(1).toString()).toStrictEqual("123.5");
    // });
    // test("zero decimal places", () => {
    //     expect(d.toDecimalPlaces(0).toString()).toStrictEqual("123");
    // });
    // test("negative number of decimal places", () => {
    //     expect(() => d.toDecimalPlaces(-1)).toThrow(RangeError);
    // });
    // test("non-integer number of decimal places", () => {
    //     expect(() => d.toDecimalPlaces(1.5)).toThrow(TypeError);
    // });
});

describe("to exponential string", () => {
    let data = {
        "123456E-2": "123456E-2",
        "123.456": "123456E-3",
        "-123.456": "-123456E-3",
        "0": "0E0",
        "1": "1E0",
    };
    for (let [input, output] of Object.entries(data)) {
        expect(new Decimal128(input).toExponentialString()).toStrictEqual(
            output
        );
    }
});
