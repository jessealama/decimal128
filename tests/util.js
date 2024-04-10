import { Decimal128 } from "../src/decimal128.mts";

export function expectDecimal128(a, b) {
    let lhs = a instanceof Decimal128 ? a.toString({ normalize: false }) : a;
    let rhs = b instanceof Decimal128 ? b.toString({ normalize: false }) : b;
    expect(lhs).toStrictEqual(rhs);
}
