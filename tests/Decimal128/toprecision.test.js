import { Decimal128 } from "../../src/Decimal128.mjs";

const NoArgument = Symbol();

describe("toPrecision", () => {
    let d = new Decimal128("123.456");

    describe("simple example", () => {

        describe.each([
            { sign: "positive", input: d, },
            { sign: "negative", input: d.negate(), },
        ])("$sign", ({ sign, input }) => {
            test.each`
                name                                                                                     | arg               | output
                ${"no arguments"}                                                                        | ${NoArgument}     | ${"123.456"}
                ${"argument is greater than total number of significant digits"}                         | ${{ digits: 7 }}  | ${"123.4560"}
                ${"argument is equal to number of significant digits"}                                   | ${{ digits: 6 }}  | ${"123.456"}
                ${"argument less than number of significant digits, rounded needed"}                     | ${{ digits: 5 }}  | ${"123.46"}
                ${"argument less than number of significant digits, rounded does not change last digit"} | ${{ digits: 4 }}  | ${"123.4"}
                ${"argument equals number of integer digits"}                                            | ${{ digits: 3 }}  | ${"123"}
                ${"argument less than number of integer digits"}                                         | ${{ digits: 2 }}  | ${"12e+2"}
                ${"single digit requested"}                                                              | ${{ digits: 1 }}  | ${"1e+3"}
            `("$name", ({ arg, output }) => {
                const d = input;
                const s = arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
                const o = sign === "positive" ? output : `-${output}`;
                expect(s).toStrictEqual(o);
            });

            test("zero digits requested", () => {
                expect(() => input.toPrecision({ digits: 0 })).toThrow(RangeError);
            });
        });
    });

    describe("", () => {
        test("non-object argument throws", () => {
            expect(() => d.toPrecision("whatever")).toThrow(TypeError);
        });
        test("object argument given, but has weird property", () => {
            expect(d.toPrecision({ foo: "bar" }).toString()).toStrictEqual(
                "123.456"
            );
        });
        test("non-integer number of digits requested", () => {
            expect(() => d.toPrecision({ digits: 1.72 }).toString()).toThrow(
                RangeError
            );
        });
        test("negative integer number of digits requested", () => {
            expect(() => d.toPrecision({ digits: -42 }).toString()).toThrow(
                RangeError
            );
        });
    });
});

describe("NaN", () => {
    let nan = new Decimal128("NaN");
    test("works", () => {
        expect(nan.toPrecision()).toStrictEqual("NaN");
    });
    test("works, digist requested", () => {
        expect(nan.toPrecision({ digits: 42 })).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test.each`
        name                                          | input      | arg               | output
        ${"positive zero"}                            | ${" 0"}    | ${NoArgument}     | ${" 0"}
        ${"negative zero"}                            | ${"-0"}    | ${NoArgument}     | ${"-0"}
        ${"zero point zero gets canonicalized"}       | ${" 0.0"}  | ${NoArgument}     | ${" 0"}
        ${"zero point zero, one significant digit"}   | ${" 0.0"}  | ${{ digits: 1 }}  | ${" 0"}
    `("$name", ({ input, arg, output }) => {
        const d = new Decimal128(input.trim());
        const s = arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
        const o = output.trim();
        expect(s).toStrictEqual(o);
    });
});

describe("infinity", () => {
    let posInf = new Decimal128("Infinity");
    let negInf = new Decimal128("-Infinity");

    test.each`
        name                                          | input      | arg                | output
        ${"positive infinity"}                        | ${posInf}  | ${NoArgument}      | ${" Infinity"}
        ${"positive infinity, digits requested"}      | ${posInf}  | ${{ digits: 42 }}  | ${" Infinity"}
        ${"negative infinity"}                        | ${negInf}  | ${NoArgument}      | ${"-Infinity"}
        ${"negative infinity, digits requested"}      | ${negInf}  | ${{ digits: 42 }}  | ${"-Infinity"}
    `("$name", ({ input: d, arg, output }) => {
        const s = arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
        const o = output.trim();
        expect(s).toStrictEqual(o);
    });
});
