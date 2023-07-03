import { Decimal128 } from "../src/decimal128";

let tests = {
    "simple example": ["4.1", "1.25", "3.28"],
    "finite decimal representation": ["0.654", "0.12", "5.45"],
    "infinite decimal representation": [
        "0.11",
        "0.3",
        "0.3666666666666666666666666666666667",
    ],
    "many digits, few significant": [
        "0.00000000000000000000000000000000000001",
        "2",
        "0.000000000000000000000000000000000000005",
    ],
    "one third": ["1", "3", "0.3333333333333333333333333333333333"],
    "one tenth": ["1", "10", "0.1"],
};

describe("division", () => {
    for (let [name, [a, b, c]] of Object.entries(tests)) {
        test(name, () => {
            expect(
                new Decimal128(a).divide(new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    }
    test("divide by zero", () => {
        expect(() =>
            new Decimal128("123.456").divide(new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
});
