// Example for stepping a value up/down
import { pow } from "./pow.js";
import { Decimal128 } from "../src/decimal128.mjs";

const ten = new Decimal128("10");

function stepUp(d, n, x) {
    let increment = pow(ten, x);
    return d.add(n.times(increment));
}

let starting = new Decimal128("1.23");
let stepped = stepUp(starting, new Decimal128("3"), new Decimal("-4"));
console.log(stepped.toFixed(4)); // 1.2305
