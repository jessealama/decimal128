describe("exponent and significand", () => {
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
