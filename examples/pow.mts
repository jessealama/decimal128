import { Decimal128 } from "../src/decimal128.mjs";

function pow(a: Decimal128, b: number): Decimal128 {
    let result = a;
    for (let i = 0; i < b; i++) {
        result = result.multiply(a);
    }
    return result;
}

export { pow };
