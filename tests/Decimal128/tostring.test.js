import { Decimal128 } from "../../src/Decimal128.mjs";
import { expectDecimal128 } from "./util.js";
import { Decimal } from "../../src/Decimal.mjs";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal128("NaN").toString()).toStrictEqual("NaN");
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal128("0").toString()).toStrictEqual("0");
    });
    test("negative zero", () => {
        expect(new Decimal128("-0").toString()).toStrictEqual("-0");
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toString()).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toString()).toStrictEqual(
            "-Infinity"
        );
    });
});

describe("normalization", () => {
    let d = new Decimal128("1.20");
    test("on by default", () => {
        expect(d.toString()).toStrictEqual("1.2");
    });
    test("can be disabled", () => {
        expect(d.toString({ preserveTrailingZeroes: true })).toStrictEqual(
            "1.20"
        );
    });
    test("not normalizing minus zero", () => {
        expect(
            new Decimal128("-0.0").toString({ preserveTrailingZeroes: true })
        ).toStrictEqual("-0.0");
    });
});
