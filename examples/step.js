// Example for stepping a value up/down
import { pow } from "./pow.js";
import { Decimal128 } from "../src/decimal128.mjs";

const ten = new Decimal128("10");

function stepUp(d, n, x) {
    let increment = pow(ten, x);
    return d.add(n.multiply(increment));
}

let starting = new Decimal128("1.23");
let stepped = stepUp(starting, new Decimal128("3"), new Decimal128("-4"));
console.log(stepped.toString({ numFractionalDigits: 4 })); // 1.2305
