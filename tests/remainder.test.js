import { Decimal128 } from "../src/decimal128.mjs";

const a = "4.1";
const b = "1.25";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            new Decimal128(a).remainder(new Decimal128(b)).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128(b)).toString()
        ).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(
            new Decimal128(a).remainder(new Decimal128("-1.25")).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(
            new Decimal128("-4.1").remainder(new Decimal128("-1.25")).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(
            new Decimal128("42").remainder(new Decimal128("0")).toString()
        ).toStrictEqual("NaN");
    });
    test("divide by minus zero", () => {
        expect(
            new Decimal128("42").remainder(new Decimal128("-0")).toString()
        ).toStrictEqual("NaN");
    });
    test("cleanly divides", () => {
        expect(
            new Decimal128("10").remainder(new Decimal128("5")).toString()
        ).toStrictEqual("0");
    });
    describe("NaN", () => {
        test("NaN remainder NaN is NaN", () => {
            expect(
                new Decimal128("NaN")
                    .remainder(new Decimal128("NaN"))
                    .toString()
            ).toStrictEqual("NaN");
        });
        test("number remainder NaN is NaN", () => {
            expect(
                new Decimal128("1").remainder(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN remainder number is NaN", () => {
            expect(
                new Decimal128("NaN").remainder(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity remainder positive infinity is NaN", () => {
            expect(posInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("positive infinity remainder negative infinity is NaN", () => {
            expect(posInf.remainder(negInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity remainder positive infinity is NaN", () => {
            expect(negInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("remainder with positive infinity", () => {
            expect(
                new Decimal128("42").remainder(posInf).toString()
            ).toStrictEqual("42");
        });
        test("remainder with negative infinity", () => {
            expect(
                new Decimal128("42").remainder(negInf).toString()
            ).toStrictEqual("42");
        });
        test("positive infinity remainder number is NaN", () => {
            expect(
                posInf.remainder(new Decimal128("42")).toString()
            ).toStrictEqual("NaN");
        });
        test("negative infinity remainder number is NaN", () => {
            expect(
                negInf.remainder(new Decimal128("42")).toString()
            ).toStrictEqual("NaN");
        });
    });
});

describe("examples from the General Decimal Arithmetic Specification", () => {
    test("example one", () => {
        expect(
            new Decimal128("2.1").remainder(new Decimal128("3")).toString()
        ).toStrictEqual("2.1");
    });
    test("example two", () => {
        expect(
            new Decimal128("10").remainder(new Decimal128("3")).toString()
        ).toStrictEqual("1");
    });
    test("example three", () => {
        expect(
            new Decimal128("-10").remainder(new Decimal128("3")).toString()
        ).toStrictEqual("-1");
    });
    test("example four", () => {
        expect(
            new Decimal128("10.2").remainder(new Decimal128("1")).toString()
        ).toStrictEqual("0.2");
    });
    test("example five", () => {
        expect(
            new Decimal128("10").remainder(new Decimal128("0.3")).toString()
        ).toStrictEqual("0.1");
    });
    test("example six", () => {
        expect(
            new Decimal128("3.6")
                .remainder(new Decimal128("1.3"), { normalize: false })
                .toString()
        ).toStrictEqual("1.0");
    });
});
