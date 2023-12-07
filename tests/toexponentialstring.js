import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("to exponential string", () => {
    let data = {
        "123456E-2": "123456E-2",
        123.456: "123456E-3",
        "-123.456": "-123456E-3",
        0: "0E0",
        1: "1E0",
    };
    for (let [input, output] of Object.entries(data)) {
        expectDecimal128(new Decimal128(input).toExponentialString(), output);
    }
});

describe("NaN", () => {
    expect(new Decimal128("NaN").toExponentialString()).toStrictEqual("NaN");
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal128("Infinity").toExponentialString()).toStrictEqual(
            "Infinity"
        );
    });
    test("negative infinity", () => {
        expect(new Decimal128("-Infinity").toExponentialString()).toStrictEqual(
            "-Infinity"
        );
    });
});
