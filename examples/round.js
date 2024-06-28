// Example with different rounding modes

// Examples from the Intl.NumberFormat spec

import { Decimal128 } from "../src/Decimal128.mjs";

let minusOnePointFive = new Decimal128("-1.5");
let zeroPointFour = new Decimal128("0.4");
let zeroPointFive = new Decimal128("0.5");
let zeroPointSix = new Decimal128("0.6");
let onePointFive = new Decimal128("1.5");

// ceiling
"-1" === minusOnePointFive.round(0, "roundTowardPositive").toString();
"1" === zeroPointFour.round(0, "roundTowardPositive").toString();
"1" === zeroPointFive.round(0, "roundTowardPositive").toString();
"1" === zeroPointSix.round(0, "roundTowardPositive").toString();
"2" === onePointFive.round(0, "roundTowardPositive").toString();

// floor
"-2" === minusOnePointFive.round(0, "roundTowardNegative").toString();
"0" === zeroPointFour.round(0, "roundTowardNegative").toString();
"0" === zeroPointFive.round(0, "roundTowardNegative").toString();
"0" === zeroPointSix.round(0, "roundTowardNegative").toString();
"1" === onePointFive.round(0, "roundTowardNegative").toString();

// truncate
"-1" === minusOnePointFive.round(0, "roundTowardZero").toString();
"0" === zeroPointFour.round(0, "roundTowardZero").toString();
"0" === zeroPointFive.round(0, "roundTowardZero").toString();
"0" === zeroPointSix.round(0, "roundTowardZero").toString();
"1" === onePointFive.round(0, "roundTowardZero").toString();

// round ties away from zero
"-2" === minusOnePointFive.round(0, "roundTiesToAway").toString();
"0" === zeroPointFour.round(0, "roundTiesToAway").toString();
"1" === zeroPointFive.round(0, "roundTiesToAway").toString();
"1" === zeroPointSix.round(0, "roundTiesToAway").toString();
"2" === onePointFive.round(0, "roundTiesToAway").toString();

// round ties to even
"-2" === minusOnePointFive.round(0, "roundTiesToEven").toString();
"0" === zeroPointFour.round(0, "roundTiesToEven").toString();
"0" === zeroPointFive.round(0, "roundTiesToEven").toString();
"1" === zeroPointSix.round(0, "roundTiesToEven").toString();
"2" === onePointFive.round(0, "roundTiesToEven").toString();
