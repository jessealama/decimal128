describe("exponent and significand", () => {
    test("decimal with very fine precision, small significand", () => {
        let s = "0.00000000000000000000000000000000000001";
        let val = new Decimal128(s);
        expect(val.significand()).toStrictEqual(1n);
        expect(val.exponent()).toStrictEqual(-38);
        expect(val.toString()).toStrictEqual(s);
    });
    test("decimal number with trailing zero", () => {
        let val = new Decimal128("0.67890");
        expect(val.significand()).toStrictEqual(67890n);
        expect(val.exponent()).toStrictEqual(-5);
    });
    let data = [
        ["123.456", 123456n, -3],
        ["0", 0n, 0],
        ["-0", 0n, 0],
        ["0.0", 0n, -1],
        ["5", 5n, 0],
        ["1.20", 120n, -2],
        ["-123.456", 123456n, -3],
        ["0.0042", 42n, -4],
        ["0.00000000000000000000000000000000000001", 1n, -38],
        ["1000", 1n, 3],
        ["-1000", 1n, 3],
        ["-0.00001", 1n, -5],
        ["0.5", 5n, -1],
        ["-10", 1n, 1],
        ["10", 1n, 1],
        ["0.000001", 1n, -6],
        ["0.0000012", 12n, -7],
    ];
    for (const [n, sigDigits, exponent] of data) {
        test(`simple example (${n})`, () => {
            let d = new Decimal128(n);
            expect(d.significand()).toStrictEqual(sigDigits);
            expect(d.exponent()).toStrictEqual(exponent);
        });
    }
    test("silently round up if too many significant digits", () => {
        expect(
            new Decimal128("1234.56789123456789123456789123456789").toString()
        ).toStrictEqual("1234.567891234567891234567891234568");
    });
    test("exponent too big", () => {
        expect(() => new Decimal128("1" + "0".repeat(7000))).toThrow(
            RangeError
        );
    });
    test("exponent too small", () => {
        expect(() => new Decimal128("0." + "0".repeat(7000) + "1")).toThrow(
            RangeError
        );
    });
});

describe("expoentntial syntax", () => {
    test("many significant digits", () => {
        let d = new Decimal128("3666666666666666666666666666666667E10");
        expect(d.significand()).toStrictEqual(
            3666666666666666666666666666666667n
        );
        expect(d.exponent()).toStrictEqual(10);
        expect(d.isNegative()).toStrictEqual(false);
    });
    test("sane string works (big E)", () => {
        let d = new Decimal128("123E456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(456);
        expect(d.isNegative()).toStrictEqual(false);
    });
    test("sane string works (little E)", () => {
        let d = new Decimal128("123e456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(456);
        expect(d.isNegative()).toStrictEqual(false);
    });
    test("negative works", () => {
        let d = new Decimal128("-123E456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(456);
        expect(d.isNegative()).toStrictEqual(true);
    });
    test("negative exponent works", () => {
        let d = new Decimal128("123E-456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(-456);
        expect(d.isNegative()).toStrictEqual(false);
    });
    test("positive exponent works", () => {
        let d = new Decimal128("123E+456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(456);
        expect(d.isNegative()).toStrictEqual(false);
    });
    test("negative significant and negative exponent works", () => {
        let d = new Decimal128("-123E-456");
        expect(d.significand()).toStrictEqual(123n);
        expect(d.exponent()).toStrictEqual(-456);
        expect(d.isNegative()).toStrictEqual(true);
    });
    describe("powers of ten", () => {
        test("two", () => {
            let d = new Decimal128("1E2");
            expect(d.significand()).toStrictEqual(1n);
            expect(d.exponent()).toStrictEqual(2);
            expect(d.isNegative()).toStrictEqual(false);
        });
        test("four", () => {
            let d = new Decimal128("1E4");
            expect(d.significand()).toStrictEqual(1n);
            expect(d.exponent()).toStrictEqual(4);
            expect(d.isNegative()).toStrictEqual(false);
        });
        test("one minus one", () => {
            let d = new Decimal128("1E-1");
            expect(d.significand()).toStrictEqual(1n);
            expect(d.exponent()).toStrictEqual(-1);
            expect(d.isNegative()).toStrictEqual(false);
        });
        test("minus one minus one", () => {
            let d = new Decimal128("-1E-1");
            expect(d.significand()).toStrictEqual(1n);
            expect(d.exponent()).toStrictEqual(-1);
            expect(d.isNegative()).toStrictEqual(true);
        });
        test("minus one one", () => {
            let d = new Decimal128("-1E1");
            expect(d.significand()).toStrictEqual(1n);
            expect(d.exponent()).toStrictEqual(1);
            expect(d.isNegative()).toStrictEqual(true);
        });
    });
});
