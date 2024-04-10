import { Decimal128 } from "../dist/esm/decimal128.mjs";

function floor(d: Decimal128): Decimal128 {
    return d.round(0, "floor");
}

export { floor };
