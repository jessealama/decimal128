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

describe("tests", () => {
    describe("with integer output", () => {
        test.each`
            input      | digits     | output
            ${" 0.0"}  |  ${1}      |  ${"0"}
            ${" 1.4"}  |  ${1}      |  ${"1"}
            ${" 1.5"}  |  ${1}      |  ${"2"}  // halfEven rounded up to even
            ${" 1.6"}  |  ${1}      |  ${"2"}
            ${" 2.4"}  |  ${1}      |  ${"1"}
            ${" 2.5"}  |  ${1}      |  ${"2"}  // halfEven rounded down to even
            ${" 2.6"}  |  ${1}      |  ${"3"}
            ${"-0.0"}  |  ${1}      | ${"-0"}
            ${"-1.4"}  |  ${1}      | ${"-1"}
            ${"-1.5"}  |  ${1}      | ${"-2"}  // halfEven rounded up to even
            ${"-1.6"}  |  ${1}      | ${"-2"}
            ${"-2.4"}  |  ${1}      | ${"-1"}
            ${"-2.5"}  |  ${1}      | ${"-2"}  // halfEven rounded down to even
            ${"-2.6"}  |  ${1}      | ${"-3"}
        `("$input precision($digits) = $output", ({ input, digits, output }) => {
            const s = new Decimal128(input.trim()).toPrecision({ digits });
            expect(s).toStrictEqual(output.trim());
        });
    });
    describe("with decimal output", () => {
        test.each`
            input      | digits     | output
            ${" 0.14"} |  ${2}      |  ${"0.1"}  
            ${" 0.15"} |  ${2}      |  ${"0.2"}  // halfEven rounded up to even
            ${" 0.16"} |  ${2}      |  ${"0.2"}
            ${" 0.24"} |  ${2}      |  ${"0.2"}  
            ${" 0.25"} |  ${2}      |  ${"0.2"}  // halfEven rounded down to even
            ${" 0.26"} |  ${2}      |  ${"0.3"}
            ${"-0.14"} |  ${2}      | ${"-0.1"}  
            ${"-0.15"} |  ${2}      | ${"-0.2"}  // halfEven rounded up to even
            ${"-0.16"} |  ${2}      | ${"-0.2"}
            ${"-0.24"} |  ${2}      | ${"-0.2"}  
            ${"-0.25"} |  ${2}      | ${"-0.2"}  // halfEven rounded down to even
            ${"-0.26"} |  ${2}      | ${"-0.3"}
        `("$input precision($digits) = $output", ({ input, digits, output }) => {
            const s = new Decimal128(input.trim()).toPrecision({ digits });
            expect(s).toStrictEqual(output.trim());
        });
    });
    describe("with exponent output", () => {
        test.each`
            input      | digits     | output
            ${" 1014"} |  ${3}      |  ${"101e+1"}  
            ${" 1015"} |  ${3}      |  ${"102e+1"}  // halfEven rounded up to even
            ${" 1016"} |  ${3}      |  ${"102e+1"}
            ${" 1024"} |  ${3}      |  ${"102e+1"}  
            ${" 1025"} |  ${3}      |  ${"102e+1"}  // halfEven rounded down to even
            ${" 1026"} |  ${3}      |  ${"103e+1"}
            ${"-1014"} |  ${3}      | ${"-101e+1"}  
            ${"-1015"} |  ${3}      | ${"-102e+1"}  // halfEven rounded up to even
            ${"-1016"} |  ${3}      | ${"-102e+1"}
            ${"-1024"} |  ${3}      | ${"-102e+1"}  
            ${"-1025"} |  ${3}      | ${"-102e+1"}  // halfEven rounded down to even
            ${"-1026"} |  ${3}      | ${"-103e+1"}
        `("$input precision($digits) = $output", ({ input, digits, output }) => {
            const s = new Decimal128(input.trim()).toPrecision({ digits });
            expect(s).toStrictEqual(output.trim());
        });
    });
    describe("with large positive exponent output", () => {
        const d = new Decimal128("1002500000_0005500000_0008500000_0001");
        //                       "1234567890_1234567890_1234567890_1234"

        describe("positive", () => {
            test.each`
                digits     | output
                 ${3}      |  ${"100e+31"}
                 ${4}      |  ${"1002e+30"}
                 ${5}      |  ${"10025e+29"}
                ${13}      |  ${"1002500000000e+21"}
                ${14}      |  ${"10025000000006e+20"}
                ${15}      |  ${"100250000000055e+19"}
                ${23}      |  ${"10025000000005500000001e+11"}
                ${24}      |  ${"100250000000055000000008e+10"}
                ${25}      |  ${"1002500000000550000000085e+9"}
            `("precision($digits) = $output", ({ digits, output }) => {
                const s = d.toPrecision({ digits });
                expect(s).toStrictEqual(output.trim());
            });
        });
        describe("negative", () => {
            const negD = d.negate();
            test.each`
                digits     | output
                 ${3}      |  ${"-100e+31"}
                 ${4}      |  ${"-1002e+30"}
                 ${5}      |  ${"-10025e+29"}
                ${13}      |  ${"-1002500000000e+21"}
                ${14}      |  ${"-10025000000006e+20"}
                ${15}      |  ${"-100250000000055e+19"}
                ${23}      |  ${"-10025000000005500000001e+11"}
                ${24}      |  ${"-100250000000055000000008e+10"}
                ${25}      |  ${"-1002500000000550000000085e+9"}
            `("precision($digits) = $output", ({ digits, output }) => {
                const s = negD.toPrecision({ digits });
                expect(s).toStrictEqual(output.trim());
            });
        });
    });

    describe("with large negative exponent output", () => {
        const d = new Decimal128("0.1002500000_0005500000_0008500000_0001");
        //                       "0.1234567890_1234567890_1234567890_1234"

        describe("positive", () => {
            test.each`
                digits     | output
                 ${3}      |  ${"0.100"}
                 ${4}      |  ${"0.1002"}
                 ${5}      |  ${"0.10025"}
                ${13}      |  ${"0.1002500000000"}
                ${14}      |  ${"0.10025000000006"}
                ${15}      |  ${"0.100250000000055"}
                ${23}      |  ${"0.10025000000005500000001"}
                ${24}      |  ${"0.100250000000055000000008"}
                ${25}      |  ${"0.1002500000000550000000085"}
            `("precision($digits) = $output", ({ digits, output }) => {
                const s = d.toPrecision({ digits });
                expect(s).toStrictEqual(output.trim());
            });
        });
        describe("negative", () => {
            const negD = d.negate();
            test.each`
                digits     | output
                 ${3}      |  ${"-0.100"}
                 ${4}      |  ${"-0.1002"}
                 ${5}      |  ${"-0.10025"}
                ${13}      |  ${"-0.1002500000000"}
                ${14}      |  ${"-0.10025000000006"}
                ${15}      |  ${"-0.100250000000055"}
                ${23}      |  ${"-0.10025000000005500000001"}
                ${24}      |  ${"-0.100250000000055000000008"}
                ${25}      |  ${"-0.1002500000000550000000085"}
            `("precision($digits) = $output", ({ digits, output }) => {
                const s = negD.toPrecision({ digits });
                expect(s).toStrictEqual(output.trim());
            });
        });
    });
});
