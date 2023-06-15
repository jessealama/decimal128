import { Decimal128, add, subtract, multiply, divide } from "../src/decimal128";

const MAX_SIGNIFICANT_DIGITS = 34;

const zero = new Decimal128("0");
const one = new Decimal128("1");
const two = new Decimal128("2");
const three = new Decimal128("3");
const four = new Decimal128("4");
const ten = new Decimal128("10");

describe("addition" + "", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    let big = new Decimal128(bigDigits);
    let minusOne = new Decimal128("-1");
    test("big is at the limit (cannot add more digits)", () => {
        expect(() => new Decimal128("9" + bigDigits)).toThrow(RangeError);
    });
    test("one plus one equals two", () => {
        expect(add(one, one).equals(two));
    });
    test("one plus minus one equals zero", () => {
        expect(add(one, minusOne).equals(zero));
        expect(add(minusOne, one).equals(zero));
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = new Decimal128("0.1");
        let b = new Decimal128("0.2");
        let c = new Decimal128("0.3");
        expect(add(a, b).equals(c));
        expect(add(b, a).equals(c));
    });
    test("big plus zero is OK", () => {
        expect(big.equals(add(big, zero)));
    });
    test("zero plus big is OK", () => {
        expect(big.equals(add(zero, big)));
    });
    test("big plus one is OK", () => {
        expect(add(big, one).equals(add(one, big)));
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => add(two, big)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => add(big, two)).toThrow(RangeError);
    });
    test("four arguments", () => {
        expect(add(one, two, three, four).equals(ten));
    });
});

describe("subtraction", () => {
    let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);
    test("subtract decimal part", () => {
        expect(
            subtract(
                new Decimal128("123.456"),
                new Decimal128("0.456")
            ).toString()
        ).toStrictEqual("123");
    });
    test("minus negative number", () => {
        expect(
            subtract(new Decimal128("0.1"), new Decimal128("-0.2")).toString()
        ).toStrictEqual("0.3");
    });
    test("close to range limit", () => {
        expect(
            subtract(new Decimal128(bigDigits), new Decimal128("9")).toString()
        ).toStrictEqual("9".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "0");
    });
    test("integer overflow", () => {
        expect(() =>
            subtract(new Decimal128("-" + bigDigits), new Decimal128("9"))
        ).toThrow(RangeError);
    });
    test("four arguments", () => {
        expect(subtract(ten, two, three, four).equals(one));
    });
});

describe("multiplication", () => {
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
        [
            "123456.123456789",
            "987654.987654321",
            "121932056088.565269013112635269",
        ],
    ];
    for (let [a, b, c] of examples)
        test(`${a} * ${b} = ${c}`, () => {
            expect(
                multiply(new Decimal128(a), new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    test("negative second argument", () => {
        expect(
            multiply(
                new Decimal128("987.654"),
                new Decimal128("-321.987")
            ).toString()
        ).toStrictEqual("-318011.748498");
    });
    test("negative first argument", () => {
        expect(
            multiply(
                new Decimal128("-987.654"),
                new Decimal128("321.987")
            ).toString()
        ).toStrictEqual("-318011.748498");
    });
    test("both arguments negative", () => {
        expect(
            multiply(
                new Decimal128("-987.654"),
                new Decimal128("-321.987")
            ).toString()
        ).toStrictEqual("318011.748498");
    });
    test("integer overflow", () => {
        expect(() =>
            multiply(
                new Decimal128("123456789123456789"),
                new Decimal128("987654321987654321")
            )
        ).toThrow(RangeError);
    });
    test("decimal overflow", () => {
        expect(() =>
            multiply(
                new Decimal128("123456789.987654321"),
                new Decimal128("987654321.123456789")
            )
        ).toThrow(RangeError);
    });
    test("four arguments", () => {
        expect(multiply(ten, two, three, four).toString()).toStrictEqual("240");
    });
});

describe("division", () => {
    let tests = {
        simple: ["4.1", "1.25", "3.28"],
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
    for (let [name, [a, b, c]] of Object.entries(tests)) {
        test(name, () => {
            expect(
                divide(new Decimal128(a), new Decimal128(b)).toString()
            ).toStrictEqual(c);
        });
    }
    test("divide by zero", () => {
        expect(() =>
            divide(new Decimal128("123.456"), new Decimal128("0.0"))
        ).toThrow(RangeError);
    });
    test("four arguments", () => {
        expect(divide(ten, two, three, four).toString()).toStrictEqual(
            "0.4166666666666666666666666666666667"
        );
    });
});
