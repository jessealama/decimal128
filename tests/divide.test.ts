import { Decimal128 } from "../src/decimal128";

const two = new Decimal128("2");
const three = new Decimal128("3");
const four = new Decimal128("4");
const ten = new Decimal128("10");

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
                Decimal128.divide(
                    new Decimal128(a),
                    new Decimal128(b)
                ).toString()
            ).toStrictEqual(c);
        });
    }
    test("divide by zero", () => {
        expect(() =>
            Decimal128.divide(new Decimal128("123.456"), new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
    test("four arguments", () => {
        expect(
            Decimal128.divide(ten, two, three, four).toString()
        ).toStrictEqual("0.4166666666666666666666666666666667");
    });
});
