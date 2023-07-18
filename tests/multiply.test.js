import { Decimal128 } from "../src/decimal128.mjs";
import { Decimal } from "../src/decimal.mjs";

let examples = [
    ["123.456", "789.789", "97504.190784"],
    ["2", "3", "6"],
    ["4", "0.5", "2"],
    ["10", "100", "1000"],
    ["0.1", "0.2", "0.02"],
    ["0.25", "1.5", "0.375"],
    ["0.12345", "0.67890", "0.083810205"],
    ["0.123456789", "0.987654321", "0.121932631112635269"],
    ["100000.123", "99999.321", "9999944399.916483"],
    ["123456.123456789", "987654.987654321", "121932056088.565269013112635269"],
    [
        "123456789.987654321",
        "987654321.123456789",
        "121932632103337905.6620941931126353",
    ],
];

describe("multiplication", () => {
    describe("worked-out examples", () => {
        for (let [a, b, c] of examples)
            test(`${a} * ${b} = ${c}`, () => {
                expect(Decimal.multiply(a, b)).toStrictEqual(c);
            });
    });
    test("negative second argument", () => {
        expect(Decimal.multiply("987.654", "-321.987")).toStrictEqual(
            "-318011.748498"
        );
    });
    test("negative first argument", () => {
        expect(Decimal.multiply("-987.654", "321.987")).toStrictEqual(
            "-318011.748498"
        );
    });
    test("both arguments negative", () => {
        expect(Decimal.multiply("-987.654", "-321.987")).toStrictEqual(
            "318011.748498"
        );
    });
    test("integer overflow", () => {
        expect(() =>
            Decimal.multiply("123456789123456789", "987654321987654321")
        ).toThrow(RangeError);
    });
    test("decimal overflow", () => {
        expect(() =>
            Decimal.multiply(
                "123456789123456789.987654321",
                "987654321123456789.123456789"
            )
        ).toThrow(RangeError);
    });
});
