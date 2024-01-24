import { Decimal128 } from "../src/decimal128.mjs";

const one = new Decimal128("1");

function pow(a, b) {
    let i = one;
    let result = a;
    while (-1 === i.cmp(b)) {
        result = result.multiply(a);
        i = i.add(one);
    }
    return result;
}

export { pow };
