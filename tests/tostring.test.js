import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    expect(new Decimal128("NaN").toString()).toStrictEqual("NaN");
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
