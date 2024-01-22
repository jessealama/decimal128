import { Decimal128 } from "../src/decimal128.mjs";

const one = new Decimal128("1");

function pow(a, b) {
    let i = one;
    let result = a;
    while (-1 === i.cmp(b)) {
        result = Decimal128.multiply(result, a);
        i = Decimal128.add(i, one);
    }
    return result;
}

export { pow };
