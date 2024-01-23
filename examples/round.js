// Example with different rounding modes

// Examples from the Intl.NumberFormat spec

let minusOnePointFive = new Decimal128("-1.5");
let zeroPointFour = new Decimal128("0.4");
let zeroPointFive = new Decimal128("0.5");
let zeroPointSix = new Decimal128("0.6");
let onePointFive = new Decimal128("1.5");

// ceiling
"-1" === minusOnePointFive.round(0, "ceil").toString();
"1" === zeroPointFour.round(0, "ceil").toString();
"1" === zeroPointFive.round(0, "ceil").toString();
"1" === zeroPointSix.round(0, "ceil").toString();
"2" === onePointFive.round(0, "ceil").toString();

// floor
"-2" === minusOnePointFive.round(0, "floor").toString();
"0" === zeroPointFour.round(0, "floor").toString();
"0" === zeroPointFive.round(0, "floor").toString();
"0" === zeroPointSix.round(0, "floor").toString();
"1" === onePointFive.round(0, "floor").toString();

// expand
"-2" === minusOnePointFive.round(0, "expand").toString();
"1" === zeroPointFour.round(0, "expand").toString();
"1" === zeroPointFive.round(0, "expand").toString();
"1" === zeroPointSix.round(0, "expand").toString();
"2" === onePointFive.round(0, "expand").toString();

// truncate
"-1" === minusOnePointFive.round(0, "trunc").toString();
"0" === zeroPointFour.round(0, "trunc").toString();
"0" === zeroPointFive.round(0, "trunc").toString();
"0" === zeroPointSix.round(0, "trunc").toString();
"1" === onePointFive.round(0, "trunc").toString();

// round ties to ceiling
"-1" === minusOnePointFive.round(0, "halfCeil").toString();
"0" === zeroPointFour.round(0, "halfCeil").toString();
"1" === zeroPointFive.round(0, "halfCeil").toString();
"1" === zeroPointSix.round(0, "halfCeil").toString();
"2" === onePointFive.round(0, "halfCeil").toString();

// round ties to floor
"-2" === minusOnePointFive.round(0, "halfFloor").toString();
"0" === zeroPointFour.round(0, "halfFloor").toString();
"0" === zeroPointFive.round(0, "halfFloor").toString();
"1" === zeroPointSix.round(0, "halfFloor").toString();
"1" === onePointFive.round(0, "halfFloor").toString();

// round ties away from zero
"-2" === minusOnePointFive.round(0, "halfExpand").toString();
"0" === zeroPointFour.round(0, "halfExpand").toString();
"1" === zeroPointFive.round(0, "halfExpand").toString();
"1" === zeroPointSix.round(0, "halfExpand").toString();
"2" === onePointFive.round(0, "halfExpand").toString();

// round ties to toward zero
"-1" === minusOnePointFive.round(0, "halfTrunc").toString();
"0" === zeroPointFour.round(0, "halfTrunc").toString();
"0" === zeroPointFive.round(0, "halfTrunc").toString();
"1" === zeroPointSix.round(0, "halfTrunc").toString();
"1" === onePointFive.round(0, "halfTrunc").toString();

// round ties to even
"-2" === minusOnePointFive.round(0, "halfEven").toString();
"0" === zeroPointFour.round(0, "halfEven").toString();
"0" === zeroPointFive.round(0, "halfEven").toString();
"1" === zeroPointSix.round(0, "halfEven").toString();
"2" === onePointFive.round(0, "halfEven").toString();
