import { ROUNDING_MODES } from "../../src/common.mjs";
import { Decimal128 } from "../../src/Decimal128.mjs";

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test.each`
            name                        | input       | output
            ${"positive odd"}           | ${"  1.5"}  | ${"  2"}
            ${"positive even"}          | ${"  2.5"}  | ${"  2"}
            ${"round up (positive)"}    | ${"  2.6"}  | ${"  3"}
            ${"round up (negative)"}    | ${" -2.6"}  | ${" -3"}
            ${"negative odd"}           | ${" -1.5"}  | ${" -2"}
            ${"negative even"}          | ${" -2.5"}  | ${" -2"}
            ${"round down (positive)"}  | ${"  1.1"}  | ${"  1"}
        `("$name", ({ input, output }) => {
            const d = new Decimal128(input.trim());
            const r = output.trim();
            expect(d.round().toString()).toStrictEqual(r);
        });
    });
    describe("round after a certain number of decimal digits", () => {
        test.each`
            name                                 | input        | decimal | output
            ${"multiple digits"}                 | ${"42.345"}  | ${2}    | ${"42.34"}
            ${"more digits than are available"}  | ${" 1.5"}    | ${1}    | ${" 1.5"}
            ${"negative odd)"}                   | ${"-1.5"}    | ${1}    | ${"-1.5"}
            ${"round down (positive))"}          | ${" 1.1"}    | ${6}    | ${" 1.1"}
        `("$name", ({ input, decimal, output }) => {
            const d = new Decimal128(input.trim());
            const r = output.trim();
            expect(d.round(decimal).toString()).toStrictEqual(r);
        });
    });
    describe("error RangeError", () => {
        const a = new Decimal128("1.5")

        test("negative number of digits requested is truncation", () => {
            expect(() => a.round(-42)).toThrow(RangeError);
        });
        test("too many digits requested", () => {
            expect(() => a.round(2 ** 53)).toThrow(RangeError);
        });
        test("unsupported rounding mode", () => {
            expect(() => a.round(0, "foobar")).toThrow(RangeError);
        });
    });
    test("integer", () => {
        expect(new Decimal128("42").round().toString()).toStrictEqual("42");
    });
    test("negative integer", () => {
        expect(new Decimal128("-42").round().toString()).toStrictEqual("-42");
    });
    test("round to zero", () => {
        expect(new Decimal128("0.5").round(0, "trunc").toString()).toStrictEqual("0");
    });
    test("round to minus zero", () => {
        expect(new Decimal128("-0.5").round(0, "trunc").toString()).toStrictEqual("-0");
    });
});

describe("Intl.NumberFormat examples", () => {
    describe("ceil", () => {
        test.each`
            input      | output
            ${"-1.5"}  | ${"-1"}
            ${" 0.4"}  | ${" 1"}
            ${" 0.5"}  | ${" 1"}
            ${" 0.6"}  | ${" 1"}
            ${" 1.5"}  | ${" 2"}
        `("$input", ({ input, output }) => {
            const a = new Decimal128(input.trim());
            const o = output.trim();
            expect(a.round(0, "ceil").toString()).toStrictEqual(o);
        });
    });
    describe("floor", () => {
        test.each`
            input      | output
            ${"-1.5"}  | ${"-2"}
            ${" 0.4"}  | ${" 0"}
            ${" 0.5"}  | ${" 0"}
            ${" 0.6"}  | ${" 0"}
            ${" 1.5"}  | ${" 1"}
        `("$input", ({ input, output }) => {
            const a = new Decimal128(input.trim());
            const o = output.trim();
            expect(a.round(0, "floor").toString()).toStrictEqual(o);
        });
    });
    describe("trunc", () => {
        test.each`
            input      | output
            ${"-1.5"}  | ${"-1"}
            ${" 0.4"}  | ${" 0"}
            ${" 0.5"}  | ${" 0"}
            ${" 0.6"}  | ${" 0"}
            ${" 1.5"}  | ${" 1"}
        `("$input", ({ input, output }) => {
            const a = new Decimal128(input.trim());
            const o = output.trim();
            expect(a.round(0, "trunc").toString()).toStrictEqual(o);
        });
    });
    describe("halfExpand", () => {
        test.each`
            input      | output
            ${"-1.5"}  | ${"-2"}
            ${" 0.4"}  | ${" 0"}
            ${" 0.5"}  | ${" 1"}
            ${" 0.6"}  | ${" 1"}
            ${" 1.5"}  | ${" 2"}
        `("$input", ({ input, output }) => {
            const a = new Decimal128(input.trim());
            const o = output.trim();
            expect(a.round(0, "halfExpand").toString()).toStrictEqual(o);
        });
    });
    describe("halfEven", () => {
        test.each`
            input      | output
            ${"-1.5"}  | ${"-2"}
            ${" 0.4"}  | ${" 0"}
            ${" 0.5"}  | ${" 0"}
            ${" 0.6"}  | ${" 1"}
            ${" 1.5"}  | ${" 2"}
        `("$input", ({ input, output }) => {
            const a = new Decimal128(input.trim());
            const o = output.trim();
            expect(a.round(0, "halfEven").toString()).toStrictEqual(o);
        });
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").round().toString()).toStrictEqual("NaN");
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test(`positive infinity (no argument)`, () => {
            expect(posInf.round().toString()).toStrictEqual("Infinity");
        });
        test.each(ROUNDING_MODES)("positive infinity (%s)", (roundingMode) => {
            expect(posInf.round(0, roundingMode).toString()).toStrictEqual("Infinity");
        });
        test(`negative infinity (no argument)`, () => {
            expect(negInf.round().toString()).toStrictEqual("-Infinity");
        });
        test.each(ROUNDING_MODES)("negative infinity (%s)", (roundingMode) => {
            expect(negInf.round(0, roundingMode).toString()).toStrictEqual("-Infinity");
        });
        test("rounding positive a certain number of digits makes no difference", () => {
            expect(posInf.round(2).toString()).toStrictEqual("Infinity");
        });
        test("rounding negative infinity a certain number of digits makes no difference", () => {
            expect(negInf.round(2).toString()).toStrictEqual("-Infinity");
        });
    });
});

describe("ceiling", () => {
    test.each`
        name                                     | input           | output
        ${"ceiling works (positive)"}            | ${" 123.456"}   | ${" 124"}
        ${"ceiling works (negative)"}            | ${"-123.456"}   | ${"-123"}
        ${"ceiling of an integer is unchanged"}  | ${" 123"}       | ${" 123"}
        ${"NaN"}                                 | ${" NaN"}       | ${" NaN"}
        ${"positive infinity"}                   | ${" Infinity"}  | ${" Infinity"}
        ${"minus infinity"}                      | ${"-Infinity"}  | ${"-Infinity"}
    `("$name", ({ input, output }) => {
        const a = new Decimal128(input.trim());
        const o = output.trim();
        expect(a.round(0, "ceil").toString()).toStrictEqual(o);
    });
});

describe("truncate", () => {
    test.each`
        input           | output
        ${" 123.45678"} | ${" 123"}
        ${"-42.99"}     | ${" -42"}
        ${" 0.00765"}   | ${"   0"}
        ${" NaN"}       | ${" NaN"}
        ${" Infinity"}  | ${" Infinity"}
        ${"-Infinity"}  | ${"-Infinity"}
    `("$input", ({ input, output }) => {
        const a = new Decimal128(input.trim());
        const o = output.trim();
        expect(a.round(0, "trunc").toString()).toStrictEqual(o);
    });
});

describe("floor", () => {
    test.each`
        name                                     | input           | output
        ${"floor works (positive)"}              | ${" 123.456"}   | ${" 123"}
        ${"floor works (negative)"}              | ${"-123.456"}   | ${"-124"}
        ${"floor of an integer is unchanged"}    | ${" 123"}       | ${" 123"}
        ${"floor of zero is unchanged"}          | ${"   0"}       | ${"   0"}
        ${"NaN"}                                 | ${" NaN"}       | ${" NaN"}
        ${"positive infinity"}                   | ${" Infinity"}  | ${" Infinity"}
        ${"minus infinity"}                      | ${"-Infinity"}  | ${"-Infinity"}
    `("$name", ({ input, output }) => {
        const a = new Decimal128(input.trim());
        const o = output.trim();
        expect(a.round(0, "floor").toString()).toStrictEqual(o);
    });
});

describe("examples for TC39 plenary slides", () => {
    let a = new Decimal128("1.456");
    test("round to 2 decimal places, rounding mode is ceiling", () => {
        expect(a.round(2, "ceil").toString()).toStrictEqual("1.46");
    });
    test("round to 1 decimal place, rounding mode unspecified", () => {
        expect(a.round(1).toString()).toStrictEqual("1.4");
        expect(a.round(1, "halfEven").toString()).toStrictEqual("1.4");
    });
    test("round to 0 decimal places, rounding mode is floor", () => {
        expect(a.round(0, "floor").toString()).toStrictEqual("1");
    });
});
