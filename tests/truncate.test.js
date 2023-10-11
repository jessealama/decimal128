import { Decimal128 } from "../src/decimal128.mjs";
import { expectDecimal128 } from "./util.js";

describe("truncate", () => {
    let data = {
        123.45678: "123",
        "-42.99": "-42",
        0.00765: "0",
    };
    for (let [key, value] of Object.entries(data)) {
        test(key, () => {
            expectDecimal128(new Decimal128(key).truncate(), value);
        });
    }
    test("NaN", () => {
        expect(new Decimal128("NaN").truncate().toString()).toStrictEqual(
            "NaN"
        );
    });
});
