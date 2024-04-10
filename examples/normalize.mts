import { Decimal128 } from "../dist/esm/decimal128.mjs";

function normalize(d: Decimal128): string {
    // Decimal128 object
    return d.toString({ normalize: true });
}

export { normalize };
