import { Decimal128 } from "../src/decimal128.mjs";

const a = "4.1";
const b = "1.25";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            Decimal128.remainder(
                new Decimal128(a),
                new Decimal128(b)
            ).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("-4.1"),
                new Decimal128(b)
            ).toString()
        ).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(
            Decimal128.remainder(
                new Decimal128(a),
                new Decimal128("-1.25")
            ).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("-4.1"),
                new Decimal128("-1.25")
            ).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("42"),
                new Decimal128("0")
            ).toString()
        ).toStrictEqual("NaN");
    });
    test("divide by minus zero", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("42"),
                new Decimal128("-0")
            ).toString()
        ).toStrictEqual("NaN");
    });
    test("cleanly divides", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("10"),
                new Decimal128("5")
            ).toString()
        ).toStrictEqual("0");
    });
    describe("NaN", () => {
        test("NaN remainder NaN is NaN", () => {
            expect(
                Decimal128.remainder(
                    new Decimal128("NaN"),
                    new Decimal128("NaN")
                ).toString()
            ).toStrictEqual("NaN");
        });
        test("number remainder NaN is NaN", () => {
            expect(
                Decimal128.remainder(
                    new Decimal128("1"),
                    new Decimal128("NaN")
                ).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN remainder number is NaN", () => {
            expect(
                Decimal128.remainder(
                    new Decimal128("NaN"),
                    new Decimal128("1")
                ).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity remainder positive infinity is NaN", () => {
            expect(
                Decimal128.remainder(posInf, posInf).toString()
            ).toStrictEqual("NaN");
        });
        test("positive infinity remainder negative infinity is NaN", () => {
            expect(
                Decimal128.remainder(posInf, negInf).toString()
            ).toStrictEqual("NaN");
        });
        test("negative infinity remainder positive infinity is NaN", () => {
            expect(
                Decimal128.remainder(negInf, posInf).toString()
            ).toStrictEqual("NaN");
        });
        test("remainder with positive infinity", () => {
            expect(
                Decimal128.remainder(new Decimal128("42"), posInf).toString()
            ).toStrictEqual("42");
        });
        test("remainder with negative infinity", () => {
            expect(
                Decimal128.remainder(new Decimal128("42"), negInf).toString()
            ).toStrictEqual("42");
        });
        test("positive infinity remainder number is NaN", () => {
            expect(
                Decimal128.remainder(posInf, new Decimal128("42")).toString()
            ).toStrictEqual("NaN");
        });
        test("negative infinity remainder number is NaN", () => {
            expect(
                Decimal128.remainder(negInf, new Decimal128("42")).toString()
            ).toStrictEqual("NaN");
        });
    });
});

describe("examples from the General Decimal Arithmetic Specification", () => {
    test("example one", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("2.1"),
                new Decimal128("3")
            ).toString()
        ).toStrictEqual("2.1");
    });
    test("example two", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("10"),
                new Decimal128("3")
            ).toString()
        ).toStrictEqual("1");
    });
    test("example three", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("-10"),
                new Decimal128("3")
            ).toString()
        ).toStrictEqual("-1");
    });
    test("example four", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("10.2"),
                new Decimal128("1")
            ).toString()
        ).toStrictEqual("0.2");
    });
    test("example five", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("10"),
                new Decimal128("0.3")
            ).toString()
        ).toStrictEqual("0.1");
    });
    test("example six", () => {
        expect(
            Decimal128.remainder(
                new Decimal128("3.6"),
                new Decimal128("1.3")
            ).toString()
        ).toStrictEqual("1.0");
    });
});
