import { Decimal128 } from "../src/decimal128.mjs";

function floor(d: Decimal128): Decimal128 {
    return d.round(0, "roundTowardNegative");
}

export { floor };
