import { Decimal128 } from "../src/Decimal128.mjs";

let exchangeRateEurToUsd = new Decimal128("1.09");
let amountInUsd = new Decimal128("450.27");
let exchangeRateUsdToEur = new Decimal128(1).divide(exchangeRateEurToUsd);

let amountInEur = exchangeRateUsdToEur.multiply(amountInUsd);
console.log(amountInEur.round(2).toString());
