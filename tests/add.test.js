import { Decimal128 } from "../src/decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal128("0");
const minusZero = new Decimal128("-0");
const one = new Decimal128("1");
const minusOne = new Decimal128("-1");
const two = new Decimal128("2");

describe("addition", () => {
    test("one plus one equals two", () => {
        expect(Decimal128.add(one, one).toString()).toStrictEqual("2");
    });
    test("one plus minus one equals zero", () => {
        expect(Decimal128.add(one, minusOne).toString()).toStrictEqual("0");
        expect(Decimal128.add(minusOne, one).toString()).toStrictEqual("0");
    });
    test("minus zero plus zero", () => {
        expect(Decimal128.add(minusZero, zero).toString()).toStrictEqual("0");
    });
    test("minus zero plus minus zero", () => {
        expect(Decimal128.add(minusZero, minusZero).toString()).toStrictEqual(
            "-0"
        );
    });
    test("two negatives", () => {
        expect(
            Decimal128.add(minusOne, new Decimal128("-99")).toString()
        ).toStrictEqual("-100");
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = "0.1";
        let b = "0.2";
        let c = "0.3";
        expect(
            Decimal128.add(new Decimal128(a), new Decimal128(b)).toString()
        ).toStrictEqual(c);
        expect(
            Decimal128.add(new Decimal128(b), new Decimal128(a)).toString()
        ).toStrictEqual(c);
    });
    let big = new Decimal128(bigDigits);
    test("big plus zero is OK", () => {
        expect(Decimal128.add(big, zero).toString()).toStrictEqual(bigDigits);
    });
    test("zero plus big is OK", () => {
        expect(Decimal128.add(zero, big).toString()).toStrictEqual(bigDigits);
    });
    test("big plus one is OK", () => {
        expect(Decimal128.add(big, one).toString()).toStrictEqual(
            Decimal128.add(one, big).toString()
        );
    });
    test("two plus big is not OK (too many significant digits)", () => {
        expect(() => Decimal128.add(two, big)).toThrow(RangeError);
    });
    test("big plus two is not OK (too many significant digits)", () => {
        expect(() => Decimal128.add(big, two)).toThrow(RangeError);
    });
    describe("non-normalized", () => {
        test("one point zero plus one point zero", () => {
            expect(
                Decimal128.add(
                    new Decimal128("1.0"),
                    new Decimal128("1.0")
                ).toString()
            ).toStrictEqual("2.0");
        });
    });
    describe("NaN", () => {
        test("NaN plus NaN is NaN", () => {
            expect(
                Decimal128.add(
                    new Decimal128("NaN"),
                    new Decimal128("NaN")
                ).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN plus number", () => {
            expect(
                Decimal128.add(
                    new Decimal128("NaN"),
                    new Decimal128("1")
                ).toString()
            ).toStrictEqual("NaN");
        });
        test("number plus NaN", () => {
            expect(
                Decimal128.add(
                    new Decimal128("1"),
                    new Decimal128("NaN")
                ).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity plus number", () => {
            expect(Decimal128.add(posInf, one).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("negative infinity plus number", () => {
            expect(Decimal128.add(negInf, one).toString()).toStrictEqual(
                "-Infinity"
            );
        });
        test("positive infinity plus positive infinity", () => {
            expect(Decimal128.add(posInf, posInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("minus infinity plus minus infinity", () => {
            expect(Decimal128.add(negInf, negInf).toString()).toStrictEqual(
                "-Infinity"
            );
        });
        test("positive infinity plus negative infinity", () => {
            expect(Decimal128.add(posInf, negInf).toString()).toStrictEqual(
                "NaN"
            );
        });
        test("minus infinity plus positive infinity", () => {
            expect(Decimal128.add(negInf, posInf).toString()).toStrictEqual(
                "NaN"
            );
        });
        test("add number to positive infinity", () => {
            expect(
                Decimal128.add(new Decimal128("123.5"), posInf).toString()
            ).toStrictEqual("Infinity");
        });
        test("add number to negative infinity", () => {
            expect(
                Decimal128.add(new Decimal128("-2"), negInf).toString()
            ).toStrictEqual("-Infinity");
        });
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("example one", () => {
        expect(
            Decimal128.add(
                new Decimal128("12"),
                new Decimal128("7.00")
            ).toString()
        ).toStrictEqual("19.00");
    });
    test("example two", () => {
        expect(
            Decimal128.add(
                new Decimal128("1E2"),
                new Decimal128("1E4")
            ).toExponentialString()
        ).toStrictEqual("1.01E+4");
    });
});
