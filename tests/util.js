import { Decimal128 } from "../src/decimal128.mjs";

export function expectDecimal128(a, b) {
    let lhs = a instanceof Decimal128 ? a.toString() : a;
    let rhs = b instanceof Decimal128 ? b.toString() : b;
    expect(lhs).toStrictEqual(rhs);
}
